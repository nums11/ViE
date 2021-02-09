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
      <div class="mt-1" v-for="(question,index) in quiz.questions">
        <NewQuizQuestionCard :question="question"
        v-on:remove-question="removeQuestion(index)" />
      </div>
    </div>
    <div style="display:none;">{{ quizName }}</div>
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
    quizName() {
      this.$emit('update-quiz-name', this.quiz.name)
      return this.quiz.name
    },
    quizHasAtLeast1Question() {
      return this.quiz.questions.length > 0
    }
  },
  created () {
  },
  methods: {
    saveQuestion(question) {
      this.quiz.questions.push(question)
      this.$emit('add-quiz-question')
    },
    removeQuestion(index) {
      this.quiz.questions.splice(index, 1)
      this.$emit('remove-quiz-question')
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