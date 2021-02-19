<template>
  <div>
    <sui-form style="width:100%; margin-top:0;">
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
          <input type="Number" placeholder="Percentile" />
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
    <BarChart ref="BarChart"
    :chart_data="chart_data"
    :chart_options="chart_options"
    :style="chart_styles" />
  </div>
</template>

<script>
import BarChart from '@/components/BarChart'
import 'chartjs-plugin-datalabels'

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
    BarChart
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
      attendance_type: null,
      top_or_bottom: null,
      chart_data: {
        labels: ['0-9', '10-19', '20-29', '30-39', '40-49',
        '50-59', '60-69', '70-79', '80-89', '90-100'],
        datasets: [{
          backgroundColor: ['rgba(232, 62, 140, 0.65)',
          'rgba(0, 179, 255, 0.65)', 'rgba(0, 184, 12, 0.65)',
            'rgba(255, 172, 38, 0.65)', 'rgba(128, 0, 255, 0.65)',
            'rgba(0, 255, 225, 0.65)'],
          borderWidth: 3,
          data: [0,0,0,0,0,0,0,0,0,0],
        }]
      },
      chart_options: {
        legend: {display: false},
        responsive: true,
        maintainAspectRatio: false,
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
            anchor: 'end',
            align: 'top',
            formatter: Math.round,
            font: {
              weight: 'bold'
            }
          }
        }
      },
      chart_styles: {

      }
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
        if(percentage === 100)
          data[9]++
        else {
          const bucket =  Math.floor(percentage/10)
          bar_data[bucket]++
        }
      })
      this.chart_data.datasets[0].data = bar_data
    },
    updateChart() {
      this.$refs.BarChart.$data._chart.update()
    }
  }
}
</script>

<style scoped>

</style>