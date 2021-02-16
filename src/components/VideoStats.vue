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
      <p class="percent mt-4">{{ avg_percent_watched.toFixed(1) }}%</p>
    </div>
    <div v-if="video.quiz != null" class="mt-3 center-text">
      <h3 class="navy-blue">Average Quiz Score</h3>
      <p class="percent">{{ avg_quiz_score.toFixed(1) }}%</p>
      <QuestionStats :questions="video.quiz.questions"
      :submissions="present_students" />
    </div>
  </div>
</template>

<script>
import PieChart from '@/components/PieChart'
import QuestionStats from '@/components/QuestionStats'
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
    PieChart,
    QuestionStats
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
      avg_percent_watched: 0,
      avg_quiz_score: 0
    }
  },
  created() {
    this.calculateTaskAverage("video_percent")
    if(this.video.quiz != null)
      this.calculateTaskAverage("quiz_score")
  },
  methods: {
    calculateTaskAverage(type) {
      let is_video_percent = false
      if(type === "video_percent")
        is_video_percent = true
      const num_present_students = this.present_students.length
      if(num_present_students > 0) {
        let total = 0
        this.present_students.forEach(student => {
          total += is_video_percent ?
          student.video_percent_watched :
          (student.num_correct_answers / this.video.quiz.questions.length)
        })
        const average = total / num_present_students
        if(is_video_percent)
          this.avg_percent_watched = average
        else
          this.avg_quiz_score = average*100 
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

.percent {
  font-size: 10rem;
  font-weight: bold;
  color: #00B3FF;
  margin-bottom: 0;
}
</style>