<script>
import { Line } from 'vue-chartjs'

export default {
  extends: Line,
  props: {
  	chart_data: {
  		type: Object,
  		required: true
  	},
  	chart_options: {
  		type: Object,
  		required: true
  	}
  },
  mounted () {
    this.renderChart(this.chart_data,
    	this.chart_options)
  }
}
</script>