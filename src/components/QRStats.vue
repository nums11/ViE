<template>
  <div>
    <h3 class="center-text navy-blue">
      Student QR Submissions
    </h3>
    <PieChart
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
    present_students: {
      type: Array,
      required: true
    },
    absent_students: {
      type: Array,
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
          data: [this.present_students.length,
            this.absent_students.length]
        }]
      },
      chart_options: {
        responsive: true,
        maintainAspectRatio: false
      }
    }
  }
}
</script>

<style scoped>
</style>