<template>
  <div id="student-real-time-quiz">
    <div id="logo-container">
      <img src="@/assets/logo.svg" id="logo" />
    </div>
    <div v-if="quiz_has_loaded">
      <div class="center-text" id="question">
        {{ current_question.question }}
      </div>
      <div v-if="!user_has_answered">
        <QuizRadioButton
        v-for="(answer, index) in
        current_question.answer_choices"
        :answer="answer" :index="index"
        v-on:select-answer-choice="selectAnswerChoice" />
        <div @click="submit" id="btn-container">
          <Button text="Submit" color="blue" size="large"
          invert_colors :disabled="!choiceSelected" />
        </div>
      </div>
      <p v-else>
        Please wait for your instructor to show
        the next question
      </p>
    </div>
  </div>
</template>

<script>
import MeetingAPI from '@/services/MeetingAPI'
import QuizAPI from '@/services/QuizAPI'
import helpers from '@/helpers.js'
import io from 'socket.io-client';
import QuizRadioButton from '@/components/QuizRadioButton'
import Button from '@/components/Button'

export default {
  name: 'StudentRealTimeQuiz',
  mixins: [helpers],
  components: {
    QuizRadioButton,
    Button
  },
  data(){
    return {
      meeting: null,
      quiz: null,
      submission: null,
      quiz_has_loaded: false,
      current_question: null,
      current_question_index: null,
      selected_choice_index: null,
      is_correct: false,
      user_has_answered: false
    }
  },
  computed: {
    choiceSelected() {
      return this.selected_choice_index != null
    }
  },
  async created() {
    try {
      this.meeting_id = this.$route.params.meeting_id
      this.quiz_id = this.$route.params.quiz_id
      await this.getMeeting()
      await this.getQuiz()
      this.submission = 
        this.checkIfStudentSubmittedToTask(this.quiz)
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
            this.getQuestion(current_question_id)
            // this.checkIfUserAnsweredCurrentQuestion()
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
          this.current_question_index = i
        }
      }
      this.quiz_has_loaded = true
      console.log("current_question", this.current_question)
    },
    checkIfUserAnsweredCurrentQuestion() {
      if(this.submission == null)
        return
      if(this.submission.quiz_answer_indices.length >
        this.current_question_index) {
        this.user_has_answered = true
        this.is_correct =
          this.submission.quiz_answer_indices[this.current_question_index]
            === this.current_question.correct_answer_index
      }
    },
    selectAnswerChoice(index) {
      this.selected_choice_index = index 
    },
    submit() {
      if(this.choiceSelected) {
        this.is_correct =
          this.selected_choice_index ===
            this.current_question.correct_answer_index
        this.client_io.emit('addStudentQuizSubmission',
          this.state_user._id, this.quiz_id,
          this.selected_choice_index, this.is_correct,
          this.submission, (submission_succesful) => {
            if(submission_succesful) {
              alert("Submission successful")
              this.user_has_answered = true
            } else
              alert("Sorry, something went wrong")
          }
        )
      }
    }
  }
}
</script>

<style scoped>
#logo-container {
  width: 8rem;
  margin: auto;
  margin-top: 1rem;
  /*border: red solid;*/
}

#logo {
  height: 8rem;
  display: inline-block;
  /*border: blue solid;*/
  margin: auto;
}

#question {
  min-height: 4rem;
  max-height: 12rem;
  line-height: 4rem;
  width: 60%;
  margin: auto;
  margin-top: 1rem;
  font-weight: bold;
  font-size: 2rem;
  color: #2c3e50;
}

#btn-container {
  width: 9rem;
  margin: auto;
  margin-top: 3rem;
}

/* Phones */
@media (max-width: 744px) {
  #logo-container {
    margin-top: 0;
  }
  #question {
    width: 90%;
    font-size: 1.5rem;
    line-height: 2.5rem;
  }
}
</style>
