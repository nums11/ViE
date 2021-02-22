<template>
  <div>
    <div class="center-text">
      <sui-button @click="$emit('hide-stats')"
      content="Back" icon="arrow left"
      label-position="left" size="small"
      class="float-left" />
      <div class="inline-block" id="student-name">
        {{ student_data.student_name }}
        ({{ student_data.user_id }})
      </div>
    </div>
    <div class="mt-3">
      <Metric
      header="Overall Attendance Percentage"
      sub_header="Percentage of meetings this student attended
         in real-time or asynchronously"
      :percentage="
        student_data.overall_attendance_percentage.toFixed(1)"
      size="medium" />
      <Metric class="ml-2"
      header="Real-Time Attendance Percentage"
      sub_header="Percentage of meetings this student attended
         in real-time"
      :percentage="
        student_data.overall_attendance_percentage.toFixed(1)"
      size="medium" />
      <Metric class="ml-2"
      header="Async Attendance Percentage"
      sub_header="Percentage of meetings this student attended
         asynchronously"
      :percentage="
        student_data.overall_attendance_percentage.toFixed(1)"
      size="medium" />
    </div>
    <LineChart
    :chart_data="chart_data"
    :chart_options="chart_options"
    :chart_styles="chart_styles" />
  </div>
</template>

<script>
import Metric from '@/components/Metric'
import LineChart from '@/components/LineChart'
import 'chartjs-plugin-datalabels'

export default {
  name: 'StudentStats',
  props: {
    student_data: {
      type: Object,
      required: true
    },
    meetings: {
      type: Array,
      required: true
    }
  },
  components: {
    Metric,
    LineChart
  },
  data() {
    return {
      chart_data: {
        labels: [],
        datasets: [{
          backgroundColor: 'rgba(232, 62, 140, 0.65)',
          borderWidth: 3,
          data: [],
        }]
      },
      chart_options: {
        legend: {display: false},
        responsive: true,
        maintainAspectRatio: false,
        title: {
          display: true,
          text: "Engagement Over Time"
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              stepSize: 1,
              max: 1,
              callback: function(value, index, values) {
                if(value === 0)
                  return "No"
                else
                  return "Yes"
              }
            },
            scaleLabel: {
              display: true,
              labelString: 'Attendance Status (Yes if they submitted to at least 1 task)'
            }
          }],
          xAxes: [{
            gridLines: {
              display: false
            },
            scaleLabel: {
              display: true,
              labelString: 'Meeting'
            },
            ticks: {
              callback: function(label) {
                if (/\s/.test(label)) {
                  return label.split(" ");
                }else{
                  return label;
                } 
              }
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
    }
  },
  created() {
    this.getChartData()
  },
  methods: {
    getChartData() {
      const attendance = this.student_data.attendance_by_meeting
      for(let i = 0; i < attendance.length; i++) {
        this.chart_data.labels.push(this.meetings[i].title)
        const attendance_status = attendance[i] === 'Yes' ?
        1 : 0
        this.chart_data.datasets[0].data.push(attendance_status)
      }
    }
  }
}
</script>

<style scoped>
#student-name {
  margin-left: -8rem;
  font-size: 1.5rem;
  margin-top: 0.5rem;
}
</style>