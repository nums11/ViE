<template>
  <div>
    <div class="inline-block">
      <h3 class="navy-blue" id="video-submissions-header">
        Student Video Submissions
      </h3>
      <PieChart
      :chart_data="chart_data"
      :chart_options="chart_options"
      :style="chart_styles" />
    </div>
    <div class="inline-block center-text"
    id="avg-video-percent-container">
      <h3 class="navy-blue">Average Video Percent Watched</h3>
      <p id="percent">{{ avg_percent_watched.toFixed(1) }}%</p>
    </div>
  </div>
</template>

<script>
import PieChart from '@/components/PieChart'
import helpers from '@/helpers.js'

export default {
  name: 'VideoStats',
  mixins: [helpers],
  props: {
    video: {
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
      },
      chart_styles: {
        height: '25rem',
        width: '35rem',
      },
      avg_percent_watched: 0
    }
  },
  created() {
    this.calculateAverageVideoPercentWatched()
  },
  methods: {
    calculateAverageVideoPercentWatched() {
      const num_present_students = this.present_students.length
      if(num_present_students > 0) {
        let total = 0;
        this.present_students.forEach(student => {
          total += student.video_percent_watched
        })
        this.avg_percent_watched = total / num_present_students
      }
    }
  }
}
</script>

<style scoped>
#video-submissions-header {
  width: 35rem;
  text-align: center;
}

#avg-video-percent-container {
  /*border: red solid;*/
  margin-left: 8rem;
}

#percent {
  font-size: 10rem;
  margin-top: 5rem;
  font-weight: bold;
  color: #00B3FF;
}
</style>