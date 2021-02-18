<template>
  <div>
    <div class="inline-block">
      <h3 class="navy-blue center-text">
        Student Video Submissions
      </h3>
      <PieChart
      :chart_data="chart_data"
      :chart_options="chart_options"
      :style="chart_styles" />
    </div>
    <div class="inline-block center-text" style="margin-left:8rem;">
      <Metric
      header="Average Video Percent Watched"
      :percentage="avg_percent_watched.toFixed(1)"
      size="large" />
    </div>
    <div v-if="video.quiz != null" class="mt-3 center-text">
      <Metric
      header="Average Quiz Score"
      :percentage="avg_quiz_score.toFixed(1)"
      size="large" />
      <QuestionStats :questions="video.quiz.questions"
      :submissions="present_students" />
    </div>
  </div>
</template>

<script>
import PieChart from '@/components/PieChart'
import Metric from '@/components/Metric'
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
    QuestionStats,
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
      chart_styles: {
        height: '25rem',
        width: '30rem',
      },
      avg_percent_watched: 0,
      avg_quiz_score: 0
    }
  },
  created() {
    this.avg_percent_watched = this.calculateTaskAverage(
      "video_percent",this.video, this.present_students)
    if(this.video.quiz != null) {
      this.avg_quiz_score = this.calculateTaskAverage(
        "quiz_score", this.video.quiz, this.present_students)
    }
  },
  methods: {
  }
}
</script>