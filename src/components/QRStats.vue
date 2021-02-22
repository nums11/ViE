<template>
  <div>
    <div class="inline-block">
      <h3 class="center-text navy-blue">
        Student QR Submissions
      </h3>
      <PieChart
      :chart_data="chart_data"
      :chart_options="chart_options"
      :styles="chart_styles" />
    </div>
    <div class="inline-block" style="margin-left:8rem;">
      <Metric
      header="QR Scan Percentage"
      sub_header="Percentage of students who scanned this qr"
      :percentage="qr_scan_percentage.toFixed(1)"
      size="large" />
    </div>
  </div>
</template>

<script>
import PieChart from '@/components/PieChart'
import Metric from '@/components/Metric'
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
    PieChart,
    Metric
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
      },
      qr_scan_percentage: 0,
      chart_styles: {
        height: '25rem',
        width: '30rem'
      }
    }
  },
  created() {
    this.qr_scan_percentage =
      (this.present_students.length /
        (this.present_students.length + this.absent_students.length))
        * 100
  }
}
</script>

<style scoped>
</style>