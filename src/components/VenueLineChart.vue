<template>
    <div></div>
</template>

<script>
import { Line, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins
export default {
    name: 'VenueLineChart',
    extends: Line,
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