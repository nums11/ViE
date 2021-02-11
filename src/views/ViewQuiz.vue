<template>
  <div id="view-quiz">
    <div id="back-to-meeting-btn">
      <router-link
      :to="{name: 'meeting_info', params: {meeting_id: meeting_id}}">
        <sui-button content="Back to Meeting" icon="arrow left"
        label-position="left" />
      </router-link>
    </div>
    <div v-if="quiz_has_loaded" class="mt-4 center-text">
      <h1>{{ quiz.name }}</h1>
      <p class="mt-2" id="num-questions">
        {{ quiz.questions.length }} questions
      </p>
      <div class="mt-3">
        <Button :text="is_instructor ? 'Start Quiz' : 'Join Quiz'"
        size="large" color="blue"
        :route_name="is_instructor ? 'instructor_real_time_quiz' :
        'student_real_time_quiz'"
        :route_params="{meeting_id: meeting_id, quiz_id: quiz_id}"
        wide />
      </div>
    </div>
  </div>
</template>

<script>
import QuizAPI from '@/services/QuizAPI'
import Button from '@/components/Button'

export default {
  name: 'ViewQuiz',
  components: {
    Button
  },
  data(){
    return {
      meeting_id: "",
      quiz: "",
      quiz: null,
      quiz_has_loaded: false
    }
  },
  created() {
    this.meeting_id = this.$route.params.meeting_id
    this.quiz_id = this.$route.params.quiz_id
    this.getQuiz()
  },
  methods: {
    async getQuiz() {
      try {
        const response = await QuizAPI.getQuiz(this.quiz_id)
        this.quiz = response.data
        this.quiz_has_loaded = true
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong")
      }
    }
  }
}
</script>

<style scoped>
#view-quiz {
  width: 90%;
  margin: auto;
  margin-top: 2rem;
}

#num-questions {
  font-size: 1.5rem;
}

/* Tablets */
@media (max-width: 1128px) {
  #back-to-meeting-btn {
    width: 14rem;
    margin: auto;
  }
}
</style>
