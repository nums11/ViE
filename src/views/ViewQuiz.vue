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
        <Button :text="btn_text" size="large" color="blue"
        :route_name="route_name" :route_params="route_params"
        :disabled="!meeting_is_real_time" wide />
      </div>
      <div class="mt-3" v-if="!meeting_is_real_time">
        <p class="warning-msg" v-if="is_instructor">
          The current time is outside of the real-time portion of your
          meeting so you are not able to start the quiz. If you would
          like to start the quiz right now, you must edit the times for
          the real-time portion of your meeting which can be done from the
          settings tab on the Meeting Page.
        </p>
        <p class="warning-msg" v-else>
          The current time is outside of the real-time portion of this
          meeting so you are not able to join the quiz.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import MeetingAPI from '@/services/MeetingAPI'
import QuizAPI from '@/services/QuizAPI'
import Button from '@/components/Button'
import helpers from '@/helpers.js'

export default {
  name: 'ViewQuiz',
  mixins: [helpers],
  components: {
    Button
  },
  data(){
    return {
      meeting_id: "",
      quiz_id: "",
      meeting: null,
      quiz: null,
      quiz_has_loaded: false,
      meeting_is_real_time: false,
      btn_text: "",
      route_name: "",
      route_params: null
    }
  },
  async created() {
    try {
      this.meeting_id = this.$route.params.meeting_id
      this.quiz_id = this.$route.params.quiz_id
      await this.getMeeting()
      this.setVariables()
      this.getQuiz()
    } catch(error) {
      console.log(error)
      alert("Sorry, something went wrong")
    }
  },
  methods: {
    async getMeeting() {
      try {
        const response = await MeetingAPI.getMeeting(
          this.meeting_id)
        this.meeting = response.data
        this.meeting_is_real_time = this.meetingIsRealTime(
          this.meeting, Date.now())
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong")
      }
    },
    setVariables() {
      if(this.is_instructor) {
        this.btn_text = "Start Quiz"
        if(this.meeting_is_real_time) {
          this.route_name = "instructor_real_time_quiz"
          this.route_params = {
            meeting_id: this.meeting_id,
            quiz_id: this.quiz_id
          }
        }
      } else {
        this.btn_text = "Join Quiz"
        if(this.meeting_is_real_time) {
          this.route_name = "student_real_time_quiz"
          this.route_params = {}
        }
      }
    },
    async getQuiz() {
      try {
        const response = await QuizAPI.getQuiz(this.quiz_id)
        this.quiz = response.data
        this.quiz_has_loaded = true
        console.log("Loaded quiz")
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
