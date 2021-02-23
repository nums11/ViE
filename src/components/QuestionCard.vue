<template>
  <div>
    <div v-if="question == null"></div>
    <div v-else class="question-card light-border-shadow">
      <div class="question">
        {{ question.question }}
      </div>
      <div class="mt-1 bold" v-if="user_has_answered">
        <p v-if="user_was_correct" class="correct-answer">
          Correct
        </p>
        <p v-else class="incorrect-answer">Incorrect</p>
      </div>
      <sui-form id="answer-form">
        <div class="answer-container">
          <div v-for="(answer,index) in question.answer_choices"
          class="mt-1">
            <sui-form-field>
              <div class="ui checkbox correct-answer">
                <input @click="selectAnswer(index)"
                type="checkbox" name="answer" :disabled="unrestricted_mode"
                />
                <label :id="`label-${index}`">{{ answer }}</label>
              </div>
            </sui-form-field>
          </div>
        </div>
        <div class="btn-container">
          <sui-button v-if="unrestricted_mode" @click="hideCard"
          content="Back" icon="arrow left" label-position="left" />
          <div v-else @click="submit" >
            <Button :text="getButtonText" size="small" color="blue"
            :disabled="disableSubmit" />
          </div>
        </div>
      </sui-form>
    </div>
  </div>
</template>

<script>
import Button from '@/components/Button'
import moment from 'moment'
import momentDurationFormatSetup from "moment-duration-format"
momentDurationFormatSetup(moment)
import helpers from '@/helpers.js'

export default {
  name: "QuestionCard",
  mixins: [helpers],
  data() {
    return {
      question: null,
      selected_indices: [],
      user_was_correct: false,
      user_has_answered: false,
      unrestricted_mode: false
    }
  },
  components: {
    Button
  },
  created() {

  },
  computed: {
    disableSubmit() {
      return this.selected_indices.length === 0
    },
    getButtonText() {
      if(this.user_has_answered)
        return "Continue"
      else
        return "Submit"
    }
  },
  methods: {
    showQuestion(question) {
      this.question = question
    },
    selectAnswer(index) {
      if(this.selected_indices.includes(index)) {
        const array_index = this.selected_indices.indexOf(index)
        this.selected_indices.splice(array_index,1)
      } else
        this.selected_indices.push(index)
    },
    submit() {
      if(!this.disableSubmit) {
        if(this.user_has_answered) {
          this.reset()
          this.$emit('resume-video')
        } else {
          this.user_was_correct = this.userWasCorrect(
            this.selected_indices, this.question.correct_answer_indices)
          this.user_has_answered = true
          this.changeAnswerColors()
          this.$emit('submit', this.selected_indices,
            this.user_was_correct)
        }
      }
    },
    changeAnswerColors() {
      for(let i = 0; i < this.question.answer_choices.length; i++) {
        let label = document.getElementById(`label-${i}`)
        if(this.question.correct_answer_indices.includes(i))
          label.style.color = "#00b80c";
        else
          label.style.color = "#FF0000";
      }
    },
    resetAnswerColors() {
      for(let i = 0; i < this.question.answer_choices.length; i++) {
        let label = document.getElementById(`label-${i}`)
        label.style.color = "black";
      }
      let checked_inputs = document.querySelector(
        'input[name="answer"]:checked')
      if(checked_inputs != null)
        checked_inputs.checked = false;
    },
    reset() {
      this.resetAnswerColors()
      this.question = null
      this.selected_indices = []
      this.user_has_answered = false
      this.user_was_correct = false
    },
    showQuestionUnrestricted(question) {
      this.question = question
      this.unrestricted_mode = true
      this.$nextTick(function() {
        this.changeAnswerColors()
      })
    },
    hideCard() {
      this.$emit('hide-card')
      this.reset()
    }
  }
};
</script>

<style scoped>
.question-card {
  width: 90%;
  border-radius: 3px;
  margin: auto;
  height: 25rem;
  padding: 2rem 1rem;
  overflow-y: auto;
}

.question {
  /*border: black solid;*/
  font-size: 1.25rem;
}


.correct-answer {
  color: #00b80c;
}

.incorrect-answer {
  color: #FF0000;
}

#answer-form {
  width: 80%;
  text-align: left;
  /*border: orange solid;*/
  margin-top: 2rem;
}

.answer-container {
  /*border: red solid;*/
  overflow-y: auto;
  min-height: 10rem;
}

.answer {
  /*border: red solid;*/
}

.btn-container {
  /*border: blue solid;*/
  width: 6rem;
  margin: auto;
  margin-top: 2rem;

}
</style>