<template>
  <div id="student-real-time-quiz">
    <div id="logo-container">
      <img src="@/assets/logo.svg" id="logo" />
    </div>
    <div v-if="quiz_has_loaded">
      <div class="center-text" id="question">
        {{ current_question.question }}
      </div>
      <div v-if="user_has_answered"
      class="mt-1 center-text bold">
        <span v-if="is_correct" class="green">
          <sui-icon name="check" /> Correct
        </span>
        <span v-else class="red">
          <sui-icon name="x" /> Incorrect
        </span>
        <div class="center-text bold" id="wait-msg">
          Please wait for the instructor to show the
          next question
        </div>
      </div>
      <div>
        <QuizRadioButton
        v-for="(answer, index) in
        current_question.answer_choices"
        :ref="`QuizRadioButton${index}`"
        :answer="answer" :index="index"
        v-on:select-answer-choice="selectAnswerChoice" />
        <div @click="submit" id="btn-container">
          <Button text="Submit" color="blue" size="large"
          :disabled="!choiceSelected || user_has_answered"
          invert_colors />
        </div>
      </div>
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
      const url = this.getBaseURL()
      this.client_io = io (url, {forceNew: true})
      this.client_io.emit('joinRealTimeQuiz', this.quiz_id,
        (quiz_exists, current_question_id) => {
          if(quiz_exists) {
            this.showQuestion(current_question_id)
            this.quiz_has_loaded = true
            this.$nextTick(function() {
              this.checkIfUserAnsweredCurrentQuestion()
            })
          }
          else
            alert("No real time quiz found")
        }
      )
      this.handleEmissions()
    },
    showQuestion(question_id) {
      const questions = this.quiz.questions
      for(let i = 0; i < questions.length; i++) {
        if(questions[i]._id === question_id) {
          this.current_question = questions[i]
          this.current_question_index = i
        }
      }
    },
    handleEmissions() {
      this.client_io.on('changeQuestion', (question_id) => {
        this.showQuestion(question_id)
        this.$nextTick(function() {
          this.checkIfUserAnsweredCurrentQuestion()
        })
      })
    },
    checkIfUserAnsweredCurrentQuestion() {
      if(this.submission == null) {
        this.user_has_answered = false
        this.removeButtonHiglights()
        return
      }

      if(this.userAnsweredQuestion(this.submission,
        this.current_question_index)) {
        this.user_has_answered = true
        this.is_correct =
          this.submission.quiz_answer_indices[this.current_question_index]
            === this.current_question.correct_answer_index
        this.highlightButtons()
      } else {
        this.user_has_answered = false
        this.removeButtonHiglights()
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
        if(this.submission != null)
          this.submission.quiz_answer_indices.push(this.selected_choice_index)
        this.client_io.emit('addStudentQuizSubmission',
          this.state_user._id, this.quiz_id,
          this.selected_choice_index, this.is_correct,
          this.submission, (submission_succesful) => {
            if(submission_succesful) {
              this.user_has_answered = true
              this.highlightButtons()
            } else
              alert("Sorry, something went wrong")
          }
        )
      }
    },
    highlightButtons() {
      for(let i = 0; i < this.current_question.answer_choices.length;
        i++) {
        const btn = this.$refs[`QuizRadioButton${i}`][0]
        if(i === this.current_question.correct_answer_index)
          btn.highlightButton(true)
        else
          btn.highlightButton(false)
      }
    },
    removeButtonHiglights() {
      for(let i = 0; i < this.current_question.answer_choices.length;
        i++) {
        const btn = this.$refs[`QuizRadioButton${i}`][0]
        btn.removeHighlight()
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
  min-height: 3rem;
  max-height: 12rem;
  line-height: 4rem;
  width: 60%;
  margin: auto;
  margin-top: 1rem;
  font-weight: bold;
  font-size: 2rem;
  color: #2c3e50;
}

.green {
  color: #00b80c;
}

.red {
  color: #FF0000;
}

#btn-container {
  width: 9rem;
  margin: auto;
  margin-top: 3rem;
}

#wait-msg {
  color: #e83e8c;
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
  #wait-msg {
    width: 80%;
    margin: auto;
    margin-top: 1rem;
  }
}
</style>