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
      <label>Add real-time portion</label>
      <input v-model="show_real_time_inputs" type="checkbox" />
      <div v-if="show_real_time_inputs" class="mt-2">
        <label>START TIME</label>
        <input type="datetime-local" v-model="real_time_portion.real_time_start" />
        <label>End TIME</label>
        <input type="datetime-local" v-model="real_time_portion.real_time_end" />
        <div class="mt-2">
          <button @click.prevent="addScan">Add QR Scan</button>
          <button @click.prevent="removeScan">Remove QR Scan</button>
          <p>Num QR SCans {{ num_qr_scans }}</p>
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
      num_qr_scans: 0,
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
      this.course_id = this.$route.params.course_id;
      const response = await CourseAPI.getCourse(this.course_id)
      this.course = response.data
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
    addScan() {
      this.num_qr_scans++
    },
    removeScan() {
      if(this.num_qr_scans > 0)
        this.num_qr_scans--
    },
    async createMeeting() {
      this.creating_meeting = true
      try {
        await MeetingAPI.addMeeting(this.title, this.real_time_portion,
          this.num_qr_scans, null, this.sections)
        this.creating_meeting = false
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong creating your meeting")
      }
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

.mt-2 {
  margin-top: 2rem;
}
</style>