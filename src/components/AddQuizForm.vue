<template>
  <div class="add-quiz-form">
    <div class="inline-block form-side">
      <h3>Add Question</h3>
      <QuestionForm v-on:save-question="saveQuestion" />
    </div>
    <div class="inline-block form-side">
      <h3>Questions ({{ questions.length }})</h3>
      <div class="mt-1" v-for="question in questions">
        <NewQuizQuestionCard :question="question" />
      </div>
    </div>
  </div>
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
      questions: []
    }
  },
  computed: {
  },
  created () {
  },
  methods: {
    saveQuestion(question) {
      this.questions.push(question)
    }
  }
}
</script>

<style scoped>
.add-quiz-form {
  /*border: black solid;*/
}

.form-side {
  /*border: blue solid;*/
  width: 50%;
}
</style>