<template>
  <div>
    <div class="inline-block">
      <h3 class="navy-blue" id="video-submissions-header">
        Student Quiz Submissions
      </h3>
      <PieChart
      :chart_data="chart_data"
      :chart_options="chart_options"
      :style="chart_styles" />
    </div>
    <div class="inline-block center-text"
    id="avg-video-percent-container">
      <h3 class="navy-blue">Average Quiz Score</h3>
      <p class="percent mt-4">{{ avg_quiz_score.toFixed(1) }}%</p>
    </div>
    <QuestionStats :questions="quiz.questions"
    :submissions="present_students" />
  </div>
</template>

<script>
import PieChart from '@/components/PieChart'
import QuestionStats from '@/components/QuestionStats'
import helpers from '@/helpers.js'

export default {
  name: 'QuizStats',
  mixins: [helpers],
  props: {
    quiz: {
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
      avg_quiz_score: 0
    }
  },
  created() {
    console.log("Quiz", this.quiz)
    this.avg_quiz_score = this.calculateTaskAverage(
      "quiz_score", this.quiz, this.present_students)
  },
  methods: {
  }
}
</script>

<style scoped>
#video-submissions-header {
  width: 35rem;
  text-align: center;
}

#avg-quiz-percent-container {
  margin-left: 8rem;
}

.percent {
  font-size: 10rem;
  font-weight: bold;
  color: #00B3FF;
  margin-bottom: 0;
}
</style>