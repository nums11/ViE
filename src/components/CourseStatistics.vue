<template>

    <div class="course-statistics">

        <h3>Chart Title Goes Here</h3>
        <VenueLineChart 
            :chartData="chartData"
            :chartOptions="chartOptions"
            :style="{height: '400px'}"
        />

    </div>

</template>
<script>

import VenueLineChart from "@/components/VenueLineChart.vue"

export default {
    name: 'CourseStatistics',
    components: {
        VenueLineChart
    },
    props: {
        sections: {},
        colorSets: []
    },
    data () {
        return {
            chartData: {},
            chartOptions: {}
        }
    },
    created () {

        this.chartData = {
            labels: ['January', 'February', 'March'],
            datasets: Object.keys(this.sections).map((key_, i) => {
                return this.sections[key_].display ? {
                    label: `Data ${i}`,
                    backgroundColor: this.colorSets[i].fill,
                    borderColor: this.colorSets[i].stroke,
                    data: [Math.random() * 100, Math.random() * 100, Math.random() * 100]
                }: {
                    label: `Data ${i}`,
                    backgroundColor: `rgba(0, 0, 0, 0)`,
                    borderColor: `rgba(0, 0, 0, 0)`,
                    data: [0, 0, 0]
                }
            })
        }

        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                display: false
            }
        }

        setInterval(() => {
            this.chartData = {
                labels: ['January', 'February', 'March'],
                datasets: Object.keys(this.sections).map((key_, i) => {
                    return this.sections[key_].display ? {
                        label: `Data ${i}`,
                        backgroundColor: this.colorSets[i].fill,
                        borderColor: this.colorSets[i].stroke,
                        data: [Math.random() * 100, Math.random() * 100, Math.random() * 100]
                    }: {
                        label: `Data ${i}`,
                        backgroundColor: `rgba(0, 0, 0, 0)`,
                        borderColor: `rgba(0, 0, 0, 0)`,
                        data: [0, 0, 0]
                    }
                })
            }
        }, 1500)

    }
}

</script>
<style lang="scss">

</style>