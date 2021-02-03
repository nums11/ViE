<template>
  <sui-modal v-model="show_modal">
    <sui-modal-header class="center-text">
      Edit Quiz
    </sui-modal-header>
    <sui-modal-content scrolling>
      <sui-form v-if="quiz != null"
      style="margin-top:0; width: 90%;">
        <div v-for="(question,index) in quiz.questions"
        :class="index != 0 ? 'mt-2' : ''">
          <sui-form-field>
            <label class="form-label">
              {{ getFormattedVideoTimestamp(
                question.video_timestamp) }}
            </label>
            <textarea v-model="question.question"
            placeholder="Type your question here"
            style="height: 6rem;" />
          </sui-form-field>
          <sui-form-field
          v-for="(choice,index) in question.answer_choices">
            <div class="ui radio checkbox"
            style="float:left; width:1rem; margin-top:0.65rem;">
              <input type="radio"
              :checked="index === question.correct_answer_index"
              disabled />
              <label></label>
            </div>
            <textarea v-model="question.answer_choices[index]"
            style="height:2rem; width:94%; margin-left: 2rem; " 
            placeholder="Type your choice here"  />
          </sui-form-field>
        </div>
      </sui-form>
    </sui-modal-content>
    <sui-modal-actions>
      <div id="action-btns-container">
        <sui-button @click="cancel">Cancel</sui-button>
        <sui-button @click="updateQuiz"
        :disabled="disableUpdateQuizBtn"
        style="background-color:#00b80c;
        color:white; margin-left:2rem;">
          Save
        </sui-button>
      </div>
    </sui-modal-actions>
  </sui-modal>
</template>

<script>
import helpers from '@/helpers.js'
import QuizAPI from '@/services/QuizAPI'

export default {
  name: 'EditQuizModal',
  mixins: [helpers],
  data () {
    return {
      show_modal: false,
      quiz: null
    }
  },
  computed: {
    disableUpdateQuizBtn() {
      if(this.quiz == null)
        return true

      for(let i = 0; i < this.quiz.questions.length; i++) {
        const question = this.quiz.questions[i]
        if(question.question.length === 0)
          return true
        for(let j = 0; j < question.answer_choices.length;
          j++) {
          if(question.answer_choices[j].length === 0)
            return true
        }
      }
      return false
    }
  },
  created () {
  },
  mounted () {
  },
  methods: {
    showModal(quiz) {
      this.quiz = quiz
      this.show_modal = true
    },
    cancel() {
      this.show_modal = false
      let self = this
      setTimeout(function() {
        self.quiz = null
      }, 500)
    },
    async updateQuiz() {
      try {
        const response = await QuizAPI.updateQuiz(this.quiz._id,
          this.quiz)
        this.quiz = response.data
        alert("Saved Changes")
        this.cancel()
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong")
      }
    }
  }
}
</script>

<style scoped>
#action-btns-container {
  width: 14rem;
  margin: auto;
}

</style>