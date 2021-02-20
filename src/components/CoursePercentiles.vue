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
          v-model="attendance_type"
          disabled />
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
    :students="table_students" />
  </div>
</template>

<script>
import BarChart from '@/components/BarChart'
import 'chartjs-plugin-datalabels'
import StudentPercentileTable from
'@/components/StudentPercentileTable'

export default {
  name: 'CoursePercentiles',
  props: {
    student_attendance_data: {
      type: Array,
      required: true
    },
    meetings: {
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
      table_title: "",
      table_students: []
    }
  },
  watch: {
    top_or_bottom: function() {
      this.updateChart()
    }
  },
  created() {
    this.getChartData()
  },
  mounted() {
    this.updateChart()
  },
  methods: {
    getChartData() {
      const bar_data = new Array(10).fill(0)
      this.student_attendance_data.forEach(data => {
        const percentage = data.overall_attendance_percentage
        this.overall_attendance_percentages.push(percentage)
        if(percentage === 100)
          data[9]++
        else {
          const bucket =  Math.floor(percentage/10)
          bar_data[bucket]++
        }
      })
      this.overall_attendance_percentages.sort(
        (a,b) => {return a-b})
      this.chart_data.datasets[0].data = bar_data
    },
    getDataForPercentileHiglighting() {
      // Get the values in the percentile
      const total_num_values = this.student_attendance_data.length
      const num_values_in_percentile =
        Math.ceil(total_num_values * (this.percentile/100))
      let values_in_percentile;
      if(this.top_or_bottom === 1) { //top
        const start_index = this.overall_attendance_percentages.length -
          num_values_in_percentile
        values_in_percentile =
          this.overall_attendance_percentages.slice(start_index)
      } else { //bottom
        values_in_percentile =
          this.overall_attendance_percentages.slice(0,
            num_values_in_percentile)

      }
      this.setTableStudents(values_in_percentile)
      // Get the line graph data points based on percentile values
      const start_bucket_index = Math.floor(values_in_percentile[0]/10)
      const end_bucket_index = Math.floor(values_in_percentile[
        num_values_in_percentile - 1]/10)
      const bar_data = this.chart_data.datasets[0].data
      const line_data = new Array(10).fill(0)
      for(let i = 0; i < 10; i++) {
        if(i >= start_bucket_index && i <= end_bucket_index)
          line_data[i] = bar_data[i]
        else
          line_data[i] = 0
      }
      this.chart_data.datasets[1].data = line_data
    },
    updateChart() {
      if(this.percentile >= 1 && this.percentile
        <= 100) {
        let percentile_half = this.top_or_bottom === 1 ?
        'top' : 'bottom'
        this.table_title = `Students in the ${percentile_half} `
        + `${this.percentile}% based on overall attendance.`
        this.getDataForPercentileHiglighting()
      }
      this.$refs.BarChart.$data._chart.update()
    },
    setTableStudents(percentile_values) {
      this.table_students = []
      this.student_attendance_data.forEach(data => {
        if(percentile_values.includes(
          data.overall_attendance_percentage)) {
          this.table_students.push({
            name: data.student_name,
            attendance_percentage:
            data.overall_attendance_percentage
          })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>