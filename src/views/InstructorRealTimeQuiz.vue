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
        <p id="num-submissions">
          {{ num_answers_for_current_question }}/{{ meeting_students.size }}
          ({{ ((num_answers_for_current_question /
            meeting_students.size)*100).toFixed(0) }} %)
        </p>
      </div>
      <BarChart ref="BarChart"
      :chart_data="chart_data"
      :chart_options="chart_options"
      :style="chart_styles" />
      <div @click="endQuiz"class="mt-1 float-right"
      id="end-quiz-btn">
        <Button text="End Quiz" color="pink" size="small"
        wide />
      </div>
    </div>
  </div>
</template>

<script>
import MeetingAPI from '@/services/MeetingAPI'
import QuizAPI from '@/services/QuizAPI'
import BarChart from '@/components/BarChart'
import Button from '@/components/Button'
import 'chartjs-plugin-datalabels'
import helpers from '@/helpers.js'
import io from 'socket.io-client';

export default {
  name: 'InstructorRealTimeQuiz',
  mixins: [helpers],
  components: {
    BarChart,
    Button
  },
  data(){
    return {
      meeting: null,
      meeting_students: [],
      quiz: null,
      quiz_has_loaded: false,
      current_question: null,
      current_question_index: 0,
      num_answers_for_current_question: 0,
      chart_data: {
        labels: [],
        datasets: [{
          backgroundColor: ['rgba(232, 62, 140, 0.65)',
          'rgba(0, 179, 255, 0.65)', 'rgba(0, 184, 12, 0.65)',
            'rgba(255, 172, 38, 0.65)', 'rgba(128, 0, 255, 0.65)',
            'rgba(0, 255, 225, 0.65)'],
          borderWidth: 3,
          data: [],
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
              stepSize: 1
            },
          }],
          xAxes: [{
            gridLines: {
              display: false
            },
            ticks: {
              callback: function(label) {
                if (/\s/.test(label)) {
                  return label.split(" ");
                }else{
                  return label;
                } 
              }
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
  async created() {
    try {
      this.meeting_id = this.$route.params.meeting_id
      this.quiz_id = this.$route.params.quiz_id
      await this.getMeeting()
      await this.getQuiz()
      this.startRealTimeQuiz()
    } catch(error) {
      console.log(error)
      alert("Sorry, something went wrong")
    }
  },
  beforeDestroy() {
    this.client_io.emit('endRealTimeQuiz', this.quiz_id,
      (event_successful) => {})
  },
  methods: {
    async getMeeting() {
      try {
        const response = await MeetingAPI.getMeeting(this.meeting_id)
        this.meeting = response.data
        this.meeting_students = this.getMeetingStudents(this.meeting)
        this.chart_options.scales.yAxes[0].ticks.max 
          = this.meeting_students.size +1
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong")
      }
    },
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
      this.num_answers_for_current_question = 0
      this.chart_data.labels = []
      this.chart_data.datasets[0].data = []
      const num_submissions_for_each_answer
        = this.getAnswersToCurrentQuestion()
      const choices = this.current_question.answer_choices
      for(let i = 0; i < choices.length; i++) {
        this.chart_data.labels.push(choices[i])
        this.chart_data.datasets[0].data.push(
          num_submissions_for_each_answer[i])
      }
    },
    getAnswersToCurrentQuestion() {
      const num_submissions_for_each_answer = new Array(
        this.current_question.answer_choices.length).fill(0)
      this.quiz.submissions.forEach(submission => {
        if(this.userAnsweredRealTimeQuestion(submission,
          this.current_question_index)) {
          this.num_answers_for_current_question++
          const user_choice_index = submission.quiz_answer_indices[
            this.current_question_index]
          num_submissions_for_each_answer[user_choice_index]++
        }
      })
      return num_submissions_for_each_answer
    },
    changeQuestion(is_next) {
      if(is_next)
        this.current_question_index++
      else
        this.current_question_index--
      this.showQuestion()
      this.emitChangeQuestionEvent()
      this.updateChart()
    },
    updateChart() {
      this.$refs.BarChart.$data._chart.update()
    },
    startRealTimeQuiz() {
      const url = this.getBaseURL()
      this.client_io = io (url, {forceNew: true})
      this.client_io.emit('startRealTimeQuiz', this.quiz_id,
        this.quiz.questions[0]._id)
      this.handleEmissions()
    },
    handleEmissions() {
      this.client_io.on('addStudentSubmission',
        (selected_answer_index, submission) => {
        this.addOrUpdateSubmission(submission)
        this.chart_data.datasets[0].data[selected_answer_index]++
        this.updateChart()
        this.num_answers_for_current_question++
      })
    },
    addOrUpdateSubmission(submission) {
      let existing_submission_index = -1
      const submissions = this.quiz.submissions
      for(let i = 0; i < submissions.length; i++) {
        if(submissions[i]._id === submission._id) {
          existing_submission_index = i
          break
        }
      }

      if(existing_submission_index === -1)
        this.quiz.submissions.push(submission)
      else
        this.quiz.submissions[existing_submission_index]
          = submission
    },
    emitChangeQuestionEvent() {
      this.client_io.emit('changeQuestion', this.quiz._id,
        this.quiz.questions[this.current_question_index]._id,
        (event_successful) => {
          if(!event_successful)
            alert("Sorry, something went wrong")
        }
      )
    },
    endQuiz() {
      this.client_io.emit('endRealTimeQuiz', this.quiz_id,
        (event_successful) => {
          if(!event_successful)
            alert("Sorry, something went wrong")
          this.$router.push({name: 'meeting_info', params: {
            meeting_id: this.meeting_id
          }})
        }
      )
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
  min-height: 8rem;
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

#end-quiz-btn {
  margin-right: 5rem;
}
</style>
