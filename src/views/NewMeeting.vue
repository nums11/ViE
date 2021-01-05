<template>
  <div id="new-meeting">
    <VueLottiePlayer v-if="creating_meeting"
      name="QR CODE"
      :animationData="require('@/assets/lottie/uploading.json')"
      loop height="100%" width="100%" autoplay
    />
    <h1>New Meeting</h1>
    <form @submit.prevent="createMeeting">
      <input v-model="title" type="text"
      placeholder="Title">
      <div class="section-selectors">
        <h5>Select the sections for your meeting</h5>
        <div v-for="section in course.sections" :key="section._id" 
        @click="selectSection(section)" class="section-selector"
        :id="`section${section.section_number}`">
          Section {{ section.section_number }}
        </div>
      </div>
      <label>Add real-time tasks</label>
      <input v-model="show_real_time_inputs" type="checkbox" />
      <div v-if="show_real_time_inputs" class="mt-2">
        <label>START TIME</label>
        <input type="datetime-local" v-model="real_time_portion.real_time_start" />
        <label>End TIME</label>
        <input type="datetime-local" v-model="real_time_portion.real_time_end" />

        <div class="mt-2">
          <h3>Add QR Scan</h3>
          <label>Scheduled Time</label>
          <input v-model="qr_scan.scheduled_time" type="datetime-local">
          <button @click.prevent="addQRScan">Add QR Scan</button>
        </div>
        <div v-for="(qr_scan, index) in qr_scans" :key="index"
        class="mt-2 qr-scan-container">
          QR Scan {{ index+1 }} 
          <span v-if="qr_scan.scheduled_time != null">
            Scheduled for {{ new Date(qr_scan.scheduled_time) }}
          </span>
          <span v-else>No Scheduled Time</span>
          <button @click.prevent="removeQRScan(index)">Remove</button>
        </div>

        <div class="mt-2">
          <h3>Add Quiz</h3>
          <input v-model="quiz.name" placeholder="name" />
          <h4>Add Question</h4>
          <div>
            <input v-model="quiz_question.question" placeholder="question" />
          </div>
          <div class="mt-1">
            <input v-model="answer_choice" placeholder="answer choice" />
            <button @click.prevent="addAnswerChoice">Add Answer Choice</button>
          </div>
        </div>
        <div v-for="(choice, index) in quiz_question.answer_choices" :key="index"
        class="qr-scan-container mt-2">
          Choice {{ index+1 }}: {{ choice }}
          <button @click.prevent="removeAnswerChoice(index)">Remove</button>
        </div>

      </div>
      <div class="mt-2">
        <button>Create Meeting</button>
      </div>
    </form>
  </div>
</template>

<script>
import CourseAPI from '@/services/CourseAPI'
import MeetingAPI from '@/services/MeetingAPI'
import NotificationAPI from '@/services/NotificationAPI'
import VueLottiePlayer from 'vue-lottie-player'

export default {
  name: 'NewMeeting',
  components: {

  },
  data () {
    return {
      title: null,
      sections: [],
      real_time_portion: {
        real_time_start: null,
        real_time_end: null
      },
      course: {},
      show_real_time_inputs: false,
      qr_scan: {},
      qr_scans: [],
      quizzes: [],
      quiz: {},
      quiz_question: {
        answer_choices: []
      },
      answer_choice: "",
      creating_meeting: false
    }
  },
  components: {
    VueLottiePlayer
  },
  computed: {
  },
  created () {
    this.getCourse()
  },
  methods: {
    async getCourse() {
      try {
        this.course_id = this.$route.params.course_id;
        const response = await CourseAPI.getCourse(this.course_id)
        this.course = response.data
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong")
      }
    },
    selectSection(section) {
     let [meeting_has_section, index] = this.meetingHasSection(section)
     let section_container = document.getElementById(`section${section.section_number}`);
     if(meeting_has_section)
       this.removeSectionFromMeeting(index, section_container)
     else {
       this.addSectionToMeeting(section, section_container)
     }
    },
    meetingHasSection(section) {
     let meeting_has_section = false
     let index = -1
     for(let i = 0; i < this.sections.length; i++) {
       if(this.sections[i].section_number
           === section.section_number){
         meeting_has_section = true
         index = i 
         break
       }
     }
     return [meeting_has_section, index]
    },
    addSectionToMeeting(section, section_container) {
     this.sections.push(section)
     section_container.classList.add("selected-section")
    },
    removeSectionFromMeeting(index, section_container) {
      this.sections.splice(index, 1);
      section_container.classList.remove("selected-section")
    },
    addQRScan() {
      this.qr_scans.push(this.qr_scan)
      this.qr_scan = {}
    },
    removeQRScan(index) {
      this.qr_scans.splice(index, 1)
    },
    async createMeeting() {
      this.creating_meeting = true
      try {
        const response = await MeetingAPI.addMeeting(this.title,
          this.real_time_portion, this.qr_scans.length, null,
          this.sections)
        const saved_meeting = response.data
        const scheduled_qr_times = this.getScheduledQRTimes()
        if(scheduled_qr_times.length > 0){
          await this.scheduleShowQRNotificationsForInstructors(
            saved_meeting._id, scheduled_qr_times)
        }
        this.$router.push({name: 'meeting_info', params: {meeting_id:
          saved_meeting._id}})        
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong creating your meeting")
      }
    },
    getScheduledQRTimes() {
      let scheduled_qr_times = []
      this.qr_scans.forEach(qr_scan => {
        const scheduled_time = qr_scan.scheduled_time
        if(scheduled_time != null)
          scheduled_qr_times.push(scheduled_time)
      })
      return scheduled_qr_times
    },
    async scheduleShowQRNotificationsForInstructors(meeting_id,
      scheduled_qr_times) {
      try {
        await NotificationAPI.scheduleShowQRNotificationsForInstructors(
          this.course.instructor._id, null, meeting_id,
          scheduled_qr_times)
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong scheduling your notifications")
      }
    },
    addAnswerChoice() {
      this.quiz_question.answer_choices.push(this.answer_choice)
      this.answer_choice = ""
    },
    removeAnswerChoice(index) {
      this.quiz_question.answer_choices.splice(index, 1)
    }
  }
}
</script>

<style scoped>
#new-meeting {
  text-align: center;
  width: 80%;
  margin: auto;
  margin-top: 2rem;
}

.section-selectors {
  width: 32rem;
  margin: auto;
  position: relative;
  margin-top: 3rem;
  margin-bottom: 3rem;
}

.section-selector {
  display: inline-block;
  text-align: center;
  margin: auto;
  margin-left: 0.75rem;
  border: #adadad solid thin;
  cursor: pointer;
  border-radius: 3px;
  height: 2rem;
  width: 6rem;
  padding-top: 0.2rem;
}

.selected-section {
  background-color: #47C4FC;
  border: #47C4FC solid;
  color: white;
}

.mt-1 {
  margin-top: 1rem;
}

.mt-2 {
  margin-top: 2rem;
}

.qr-scan-container {
  border: black solid;
}
</style>