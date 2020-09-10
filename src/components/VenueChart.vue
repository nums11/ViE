<script>
    import { Doughnut, mixins } from 'vue-chartjs'
    const { reactiveProp } = mixins
    export default {
        name: 'VenueChart',
        extends: Doughnut,
        mixins: [reactiveProp],
        props: {
            chartData: Object,
            chartOptions: Object
        },
        created () {
        },
        mounted () {
            this.renderChart(this.chartData, this.chartOptions)
        }
    }
</script>
<style lang="scss">
</style>