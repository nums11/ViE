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
        <sui-popup content="Mark this choice as correct"
        position="top center" inverted>
          <div class="ui checkbox" slot="trigger"
          style="float:left; margin-top:0.65rem;">
            <input @click="markCorrect(index)" 
            type="checkbox" name="correct_answer_index" />
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
        correct_answer_indices: [],
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
      this.question.correct_answer_indices.length === 0
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
      if(this.question.correct_answer_indices.includes(index)) {
        this.removeIndexFromCorrectAnswerIndices(index)
        this.uncheckAnswers()
      }
    },
    markCorrect(index) {
      if(this.question.correct_answer_indices.includes(index))
        this.removeIndexFromCorrectAnswerIndices(index)
      else
        this.question.correct_answer_indices.push(index)
    },
    removeIndexFromCorrectAnswerIndices(index) {
      const array_index =
        this.question.correct_answer_indices.indexOf(index)
      this.question.correct_answer_indices.splice(array_index,1)
    },
    clearQuestion() {
      this.question = {
        question: "",
        answer_choices: [
          {text: ""},
          {text: ""}
        ],
        correct_answer_indices: [],
        video_timestamp: 0
      }
      this.uncheckAnswers()
    },
    uncheckAnswers() {
      const checkboxes =
        document.getElementsByName('correct_answer_index')
      checkboxes.forEach(checkbox => {
        checkbox.checked = false
      })
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
</style>