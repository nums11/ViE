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
              <div class="ui radio checkbox correct-answer">
                <input @click="selectAnswer(index)"
                type="radio" name="answer" />
                <label :id="`label-${index}`">{{ answer }}</label>
              </div>
            </sui-form-field>
          </div>
        </div>
        <div @click="submit" class="btn-container">
          <Button :text="getButtonText" size="small" color="blue"
          :disabled="disableSubmit" />
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

export default {
  name: "QuestionCard",
  data() {
    return {
      question: null,
      selected_answer_index: null,
      user_was_correct: false,
      user_has_answered: false
    }
  },
  components: {
    Button
  },
  created() {

  },
  computed: {
    disableSubmit() {
      return this.selected_answer_index == null
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
      this.selected_answer_index = index
      console.log("selected_answer", this.selected_answer_index)
    },
    submit() {
      if(!this.disableSubmit) {
        if(this.user_has_answered) {
          this.$emit('resume-video')
          this.reset()
        } else {
          this.user_was_correct =
            this.selected_answer_index === this.question.correct_answer_index
          this.user_has_answered = true
          this.changeAnswerColors()
          this.$emit('submit', this.selected_answer_index,
            this.user_was_correct)
        }
      }
    },
    changeAnswerColors() {
      for(let i = 0; i < this.question.answer_choices.length; i++) {
        let label = document.getElementById(`label-${i}`)
        if(i === this.question.correct_answer_index)
          label.style.color = "#00b80c";
        else
          label.style.color = "#FF0000";
      }
    },
    reset() {
      this.question = null
      this.selected_answer_index = null
      this.user_has_answered = false
      this.user_was_correct = false
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