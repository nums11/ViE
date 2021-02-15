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
    // console.log("chart", this.$data._chart)
  }
  // watch: {
  // 	chart_data: {
	 //  	 handler(old_chart_data, new_chart_data) {
	 //  	 	// this.chart_data = new_chart_data
	 //  		console.log("chart_data updated", new_chart_data)
	 //  		this.$data._chart.update()
	 //  		// this._chart.destroy();
	 //  		// this.renderChart(new_chart_data,
	 //  		// 	this.chart_options)
	 //  	},
	 //  	deep: true
	 //  }
  // }
}
</script>