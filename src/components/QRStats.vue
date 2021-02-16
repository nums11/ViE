<template>
  <div class="mt-3 qr-stats">
    <div>
      Statistics
      <sui-button @click="$emit('hide-stats')"
      content="Back" icon="arrow left"
      label-position="left" size="small"
      class="float-right" />
    </div>
    <PieChart
    v-if="chart_data_loaded"
    :chart_data="chart_data"
    :chart_options="chart_options" />
  </div>
</template>

<script>
import PieChart from '@/components/PieChart'
import helpers from '@/helpers.js'

export default {
  name: 'QRStats',
  mixins: [helpers],
  props: {
    qr_scan: {
      type: Object,
      required: true
    },
    meeting_students: {
      type: Set,
      required: true
    }
  },
  components: {
    PieChart
  },
  data () {
    return {
      chart_data: {
        labels: ["Present", "Absent"],
        datasets: [{
          backgroundColor: ['rgba(0, 179, 255, 0.65)',
          'rgba(232, 62, 140, 0.65)'],
          data: []
        }]
      },
      chart_options: {
        responsive: true,
        maintainAspectRatio: false
      },
      chart_data_loaded: false,
      present_students: 0,
      absent_students: 0
    }
  },
  created () {
    const students = this.getPresentAndAbsentStudents(
      this.meeting_students, this.qr_scan)
    this.present_students = students.present_students
    this.absent_students = students.absent_students
    this.chart_data.datasets[0].data =
      [this.present_students.length, this.absent_students.length]
    this.chart_data_loaded = true
    // this.$refs.BarChart.$data._chart.update()
  },
  methods: {
  }
}
</script>

<style scoped>
.qr-stats {
  /*border: black solid;*/
}
</style>