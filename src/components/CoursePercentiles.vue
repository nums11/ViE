<template>
  <div>
    <sui-form style="width:100%; margin-top:0;"
    @submit.prevent>
      <sui-form-fields>
        <sui-form-field inline>
          <label>Attendance Type</label>
          <sui-dropdown selection
          placeholder="Attendance Type"
          :options="attendance_type_options"
          v-model="attendance_type" />
        </sui-form-field>
        <sui-form-field style="margin-left:3rem;" inline>
          <label>Percentile</label>
          <input type="Number" placeholder="Percentile"
          v-model="percentile" min="1" max="100"
          @change="updateChart" />
        </sui-form-field>
        <sui-form-field style="margin-left:3rem;" inline>
          <label>Top or Bottom</label>
           <sui-dropdown selection
          placeholder="Top or Bottom"
          :options="top_or_bottom_options"
          v-model="top_or_bottom" />
        </sui-form-field>
      </sui-form-fields>
    </sui-form>
    <p class="bold center-text pink-text">
      The pink area represents {{ table_title.toLowerCase() }}
    </p>
    <BarChart ref="BarChart"
    :chart_data="chart_data"
    :chart_options="chart_options"
    :style="chart_styles" />
    <StudentPercentileTable :table_title="table_title"
    :attendance_type="attendanceType"
    :students="table_students" />
  </div>
</template>

<script>
import BarChart from '@/components/BarChart'
import 'chartjs-plugin-datalabels'
import StudentPercentileTable from
'@/components/StudentPercentileTable'
import helpers from '@/helpers.js'

export default {
  name: 'CoursePercentiles',
  mixins: [helpers],
  props: {
    student_attendance_data: {
      type: Array,
      required: true
    }
  },
  components: {
    BarChart,
    StudentPercentileTable
  },
  data () {
    return {
      attendance_type_options: [
        {
          text: "Overall",
          value: 1
        },
        {
          text: "Real-Time",
          value: 2
        },
        {
          text: "Async",
          value: 3
        },
      ],
      top_or_bottom_options: [
        {
          text: "Top",
          value: 1
        },
        {
          text: "Bottom",
          value: 2
        }
      ],
      attendance_type: 1,
      percentile: 50,
      top_or_bottom: 1,
      chart_data: {
        labels: ['0-9', '10-19', '20-29', '30-39', '40-49',
        '50-59', '60-69', '70-79', '80-89', '90-100'],
        datasets: [{
          backgroundColor: 'rgba(0, 179, 255, 0.65)',
          borderWidth: 3,
          data: [0,0,0,0,0,0,0,0,0,0],
          order: 1
        }, {
          type: "line",
          backgroundColor: 'rgba(232, 62, 140, 0.65)',
          borderColor: 'rgba(232, 62, 140, 1)',
          data: [0,0,0,5, 10],
          order: 2
        }]
      },
      chart_options: {
        legend: {display: false},
        responsive: true,
        maintainAspectRatio: false,
        title: {
          display: true,
          text: "Frequency of Overall Attendance Percentages"
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              stepSize: 1,
              max: this.student_attendance_data.length
            },
            scaleLabel: {
              display: true,
              labelString: 'Student Frequency'
            }
          }],
          xAxes: [{
            gridLines: {
              display: false
            },
            scaleLabel: {
              display: true,
              labelString: 'Attendance Percentage Range'
            }
          }]
        },
        plugins: {
          datalabels: {
            display: false
          }
        }
      },
      chart_styles: {},
      overall_attendance_percentages: [],
      real_time_attendance_percentages: [],
      async_attendance_percentages: [],
      table_title: "",
      table_students: []
    }
  },
  watch: {
    top_or_bottom: function() {
      this.updateChart()
    },
    attendance_type: function() {
      this.getChartData()
      this.updateChart()
    }
  },
  computed: {
    attendanceType() {
      return this.attendance_type_options[
        this.attendance_type-1].text
    }
  },
  created() {
    const attendance_percentages =
      this.getAttendancePercentagesFromStudentData(
        this.student_attendance_data)
    this.overall_attendance_percentages =
      attendance_percentages.overall_attendance_percentages
    this.real_time_attendance_percentages =
      attendance_percentages.real_time_attendance_percentages
    this.async_attendance_percentages =
      attendance_percentages.async_attendance_percentages
    this.getChartData()
  },
  mounted() {
    this.updateChart()
  },
  methods: {
    getChartData() {
      const bar_data = new Array(10).fill(0)
      const percentages =
        this.getPercentagesBasedOnAttendanceType()
      percentages.forEach(percentage => {
        if(percentage === 100)
          bar_data[9]++
        else {
          const bucket =  Math.floor(percentage/10)
          bar_data[bucket]++
        }
      })
      this.chart_data.datasets[0].data = bar_data
    },
    getDataForPercentileHiglighting() {
      const percentages =
        this.getPercentagesBasedOnAttendanceType()
      const percentile_values = this.getPercentileValues(
        this.student_attendance_data, percentages,
        this.percentile, this.top_or_bottom === 1)
      this.table_students = this.getStudentsInPercentile(
        this.student_attendance_data, percentile_values,
        this.attendance_type)
      // Get the line graph data points based on percentile values
      let start_bucket_index = Math.floor(percentile_values[0]/10)
      let end_bucket_index = Math.floor(percentile_values[
        percentile_values.length - 1]/10)
      if(start_bucket_index === 10)
        start_bucket_index = 9
      if(end_bucket_index === 10)
        end_bucket_index = 9
      const bar_data = this.chart_data.datasets[0].data
      const line_data = new Array(10).fill(0)
      for(let i = 0; i < 10; i++) {
        if(i >= start_bucket_index && i <= end_bucket_index) {
          console.log("here, i", i)
          console.log("bar_data[i]", bar_data[i])
          line_data[i] = bar_data[i]
        }
        else {
          console.log("outisde, i", i)
          line_data[i] = 0
        }
      }
      console.log("line_data", line_data)
      this.chart_data.datasets[1].data = line_data
    },
    getPercentagesBasedOnAttendanceType() {
      if(this.attendance_type === 1)
        return this.overall_attendance_percentages
      else if(this.attendance_type === 2)
        return this.real_time_attendance_percentages
      else
        return this.async_attendance_percentages
    },
    updateChart() {
      if(this.percentile >= 1 && this.percentile
        <= 100) {
        const percentile_half = this.top_or_bottom === 1 ?
        'top' : 'bottom'
        const attendance_type = this.attendanceType.toLowerCase() 
        this.table_title = `Students in the ${percentile_half} `
        + `${this.percentile}% based on ${attendance_type} attendance.`
        this.getDataForPercentileHiglighting()
      }
      this.$refs.BarChart.$data._chart.update()
    }
  }
}
</script>

<style scoped>

</style>