<template>
  <sui-form class="question-form">
    <sui-form-field>
      <label class="form-label">Question</label>
      <textarea v-model="question.question" id="question-input"
      placeholder="Type your question here" />
    </sui-form-field>
    <sui-form-field
      v-for="(choice,index) in question.answer_choices">
      <label class="float-left" style="margin-left:2.5rem;">
        Choice {{ index + 1 }}
      </label>
      <sui-icon v-if="question.answer_choices.length > 2"
      @click="removeChoice(index)" name="x" class="float-right pointer"
      style="margin-right:1rem;" />
      <sui-form-field>
        <sui-popup content="Mark this choice as the correct answer"
        position="top center" inverted>
          <div class="ui radio checkbox" slot="trigger"
          style="float:left; margin-top:0.65rem;">
            <input @click="markCorrect(index)" 
            type="radio" name="correct_answer_index" />
            <label></label>
          </div>
        </sui-popup>
        <textarea v-model="choice.text" style="width:85%;height: 3rem;" 
        placeholder="Type your choice here"  />
      </sui-form-field>
    </sui-form-field>
    <p @click="addChoice" class="add-choice">
      + Add another answer choice
    </p>
    <p v-if="questionInputsFilled && disableSaveQuestionBtn"
    class="warning-msg">
      <sui-icon name="exclamation triangle" size="small" />
      You must select at least 1 correct answer
    </p>
    <div class="mt-2">
      <sui-button @click.prevent="clearQuestion">Clear</sui-button>
      <sui-button @click.prevent="saveQuestion"
      :disabled="disableSaveQuestionBtn"
      style="background-color:#00B3FF;
      color:white; margin-left:2rem;">
        Save Question
      </sui-button>
    </div>
  </sui-form>
</template>

<script>
export default {
  name: 'QuestionForm',
  data () {
    return {
      question: {
        question: "",
        answer_choices: [
          {text: ""},
          {text: ""}
        ],
        correct_answer_index: null,
        video_timestamp: 0
      },
    }
  },
  computed: {
    questionInputsFilled() {
      if(this.question.question.length === 0)
        return false
      const answer_choices = this.question.answer_choices
      for(let i =0; i < answer_choices.length; i++) {
        if(answer_choices[i].text.length === 0) {
          return false
        }
      }
      return true
    },
    disableSaveQuestionBtn() {
      return !this.questionInputsFilled ||
      this.question.correct_answer_index == null
    },
  },
  created () {
  },
  methods: {
    addChoice() {
      this.question.answer_choices.push({
        text: ""
      })
    },
    removeChoice(index) {
      this.question.answer_choices.splice(index, 1)
      if(this.question.correct_answer_index === index) {
        this.question.correct_answer_index = null
        this.uncheckAnswers()
      }
    },
    markCorrect(index) {
      this.question.correct_answer_index = index
    },
    clearQuestion() {
      this.question = {
        question: "",
        answer_choices: [
          {text: ""},
          {text: ""}
        ],
        correct_answer_index: null,
        video_timestamp: 0
      }
      this.uncheckAnswers()
    },
    uncheckAnswers() {
      let checked_inputs = document.querySelector(
        'input[name="correct_answer_index"]:checked')
      if(checked_inputs != null)
        checked_inputs.checked = false;
    },
    saveQuestion() {
      this.$emit('save-question', this.question)
      this.clearQuestion()
    },
  }
}
</script>

<style scoped>
.question-form {
  margin-top: 1rem;
  width: 100%;
  padding-right: 2rem;
  padding-left: 2rem;
}

.question-input {
  height: 6rem;
}

.add-choice {
  cursor: pointer;
  font-weight: bold;
  color: #a6a6a6;
}

.warning-msg {
  background-color: #fff4d3;
  border-radius: 2px;
  padding: 0;
}
</style>