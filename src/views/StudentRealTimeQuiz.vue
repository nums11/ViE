<template>
  <div id="student-real-time-quiz">
    <h1>Student quiz</h1>
  </div>
</template>

<script>
import MeetingAPI from '@/services/MeetingAPI'
import QuizAPI from '@/services/QuizAPI'
import helpers from '@/helpers.js'
import io from 'socket.io-client';

export default {
  name: 'StudentRealTimeQuiz',
  mixins: [helpers],
  components: {
  },
  data(){
    return {
      meeting: null,
      quiz: null,
      current_question: null
    }
  },
  async created() {
    try {
      this.meeting_id = this.$route.params.meeting_id
      this.quiz_id = this.$route.params.quiz_id
      await this.getMeeting()
      await this.getQuiz()
      this.joinRealTimeQuiz()
    } catch(error) {
      console.log(error)
      alert("Sorry, something went wrong")
    }
  },
  methods: {
    async getMeeting() {
      try {
        const response = await MeetingAPI.getMeeting(this.meeting_id)
        this.meeting = response.data
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong")
      }
    },
    async getQuiz() {
      try {
        const response = await QuizAPI.getQuiz(this.quiz_id)
        this.quiz = response.data
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong")
      }
    },
    joinRealTimeQuiz() {
      console.log("Here")
      const url = this.getBaseURL()
      this.client_io = io (url, {forceNew: true})
      this.client_io.emit('joinRealTimeQuiz', this.quiz_id,
        (quiz_exists, current_question_id) => {
          if(quiz_exists) {
            alert(`Quiz exists question_id ${current_question_id}`)
            this.getQuestion(current_question_id)
          }
          else
            alert("No real time quiz found")
        }
      )
    },
    getQuestion(question_id) {
      const questions = this.quiz.questions
      for(let i = 0; i < questions.length; i++) {
        if(questions[i]._id === question_id) {
          this.current_question = questions[i]
        }
      }
      console.log("current_question", this.current_question)
    }
  }
}
</script>

<style scoped>

</style>
