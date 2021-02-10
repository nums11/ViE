<template>
  <div>
    <sui-loader v-if="!quiz_has_loaded"
    active size="large">
      Loading Quiz
    </sui-loader>
    <div v-else>
      <div id="btn-area">
        <sui-button @click="changeQuestion(false)"
        content="Previous Question"
        icon="arrow left"
        label-position="left"
        style="background-color:#00B3FF; color:white;"
        :disabled="current_question_index === 0" />
        <sui-button @click="changeQuestion(true)"
        content="Next Question"
        icon="arrow right"
        label-position="right"
        class="float-right"
        style="background-color:#00b80c; color: white;"
        :disabled="current_question_index === quiz.questions.length-1" />
      </div>
      <div id="logo-container">
        <img src="@/assets/logo.svg" id="logo" />
      </div>
      <div class="center-text" id="question">
        {{ current_question.question }}
      </div>
      <div class="center-text wrap-text" id="submissions">
        Submissions Received
        <p id="num-submissions">10/20 (50%)</p>
      </div>
      <BarChart ref="BarChart"
      :chart_data="chart_data"
      :chart_options="chart_options"
      :style="chart_styles" />
      <div class="mt-1 float-right" id="stop-quiz-btn">
        <Button text="Stop Quiz" color="pink" size="small"
        wide />
      </div>
    </div>
  </div>
</template>

<script>
import QuizAPI from '@/services/QuizAPI'
import BarChart from '@/components/BarChart'
import Button from '@/components/Button'
import 'chartjs-plugin-datalabels'

export default {
  name: 'RealTimeQuiz',
  components: {
    BarChart,
    Button
  },
  data(){
    return {
      quiz_id: "",
      quiz: null,
      quiz_has_loaded: false,
      current_question: null,
      current_question_index: 0,
      chart_data: {
        labels: [],
        datasets: [{
          backgroundColor: ['rgba(232, 62, 140, 0.65)',
          'rgba(0, 179, 255, 0.65)', 'rgba(0, 184, 12, 0.65)',
            'rgba(255, 172, 38, 0.65)', 'rgba(128, 0, 255, 0.65)',
            'rgba(0, 255, 225, 0.65)'],
          borderWidth: 3,
          data: [10, 20, 30, 40, 50, 60],
        }]
      },
      chart_options: {
        legend: {display: false},
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              max: 70
            },
          }],
          xAxes: [{
            gridLines: {
              display: false
            }
          }]
        },
        plugins: {
          datalabels: {
            anchor: 'end',
            align: 'top',
            formatter: Math.round,
            font: {
              weight: 'bold'
            }
          }
        }
      },
      chart_styles: {
        width: '90%',
        height: '25rem',
        margin: 'auto',
        'margin-top': '1rem'
      }
    }
  },
  created() {
    this.quiz_id = this.$route.params.quiz_id
    this.getQuiz()
  },
  methods: {
    async getQuiz() {
      try {
        const response = await QuizAPI.getQuiz(this.quiz_id)
        this.quiz = response.data
        this.showQuestion()
        this.quiz_has_loaded = true
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong")
      }
    },
    showQuestion() {
      this.current_question = this.quiz.questions[
        this.current_question_index]
      this.chart_data.labels = []
      this.current_question.answer_choices.forEach(choice => {
        this.chart_data.labels.push(choice)
      })
    },
    changeQuestion(is_next) {
      if(is_next)
        this.current_question_index++
      else
        this.current_question_index--
      this.showQuestion()
      this.$refs.BarChart.$data._chart.update()
    }
  }
}
</script>

<style scoped>
#btn-area {
  /*border: black solid;*/
  padding-top: 1rem;
  padding-right: 2rem;
  padding-left: 2rem;
}

#logo-container {
  width: 4rem;
  /*display: inline-block;*/
  margin: auto;
}

#logo {
  height: 4rem;
  display: inline-block;
  /*border: blue solid;*/
  margin: auto;
}

#question {
  /*border: blue solid;*/
  height: 8rem;
  line-height: 4rem;
  width: 90%;
  margin: auto;
  margin-top: 1rem;
  font-weight: bold;
  font-size: 2rem;
  color: #2c3e50;
}

#submissions {
  margin: auto;
  margin-top: 1rem;
  /*border: blue solid;*/
  font-size: 1.3rem;
}

#num-submissions {
  /*border: red solid;*/
  margin-top: 0.75rem;
  font-weight: bold;
  color: #2c3e50;
}

#stop-quiz-btn {
  margin-right: 5rem;
}
</style>
