<script>
import { Bar } from 'vue-chartjs'

export default {
  extends: Bar,
  props: {
  	chart_data: Object,
  	chart_options: Object
  },
  mounted () {
    this.renderChart(this.chart_data,
    	this.chart_options)
  }
}
</script>