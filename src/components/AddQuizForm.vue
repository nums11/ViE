<template>
  <sui-form class="add-quiz-form">
    <sui-form-field class="add-task-form-field" required>
      <label class="form-label">Quiz Name</label>
      <input v-model="quiz.name" />
    </sui-form-field>
    <div class="inline-block form-side mt-1">
      <h3>Add Question</h3>
      <QuestionForm ref="QuestionForm"
      v-on:save-question="saveQuestion" />
    </div>
    <div class="inline-block form-side mt-1">
      <h3>Questions ({{ quiz.questions.length }})</h3>
      <div class="mt-1" v-for="question in quiz.questions">
        <NewQuizQuestionCard :question="question" />
      </div>
    </div>
  </sui-form>
</template>

<script>
import QuestionForm from '@/components/QuestionForm'
import NewQuizQuestionCard from
'@/components/NewQuizQuestionCard'

export default {
  name: 'AddQuizForm',
  props: {

  },
  components: {
    QuestionForm,
    NewQuizQuestionCard
  },
  data () {
    return {
      quiz: {
        name: "",
        questions: []
      }
    }
  },
  computed: {
  },
  created () {
  },
  methods: {
    saveQuestion(question) {
      this.quiz.questions.push(question)
    },
    clear() {
      this.quiz = {
        name: "",
        questions: []
      }
      this.$refs.QuestionForm.clearQuestion()
    }
  }
}
</script>

<style scoped>
.add-quiz-form {
  /*border: black solid;*/
  width: 100%;
  margin-top: 0;
}

.form-side {
  width: 50%;
}
</style>