<template>
  <div id="new-meeting">
    <VueLottiePlayer v-if="creating_meeting"
      name="QR CODE"
      :animationData="require('@/assets/lottie/uploading.json')"
      loop height="100%" width="100%" autoplay
    />
    <div id="left-section" class="inline-block">
      <div class="floated-right-container">
        <router-link id="back-to-course-btn"
        :to="{name: 'course_info', params: {id: course_id}}">
          <sui-button content="Back to Course" icon="arrow left"
          label-position="left" />
        </router-link>
        <img src="@/assets/logo.svg" id="logo" />
      </div>
      <div class="floated-right-container"
      id="real-time-portion-container">
        <div v-if="realTimePortionSet" @click="clearRealTimePortion"
        class="inline-block" id="clear-btn-container">
          <sui-button content="clear" size="mini" />
        </div>
        <div class="inline-block">
          <h4>Real-Time Portion</h4>
        </div>
        <p class="mt-1" v-if="realTimePortionSet">
          {{ real_time_portion.real_time_start | moment("M/d h:mm a") }}
          - {{ real_time_portion.real_time_end | moment("M/d h:mm a") }}
        </p>
        <p class="mt-1" v-else>No real-time portion</p>
        <NewMeetingTaskCard v-for="(qr_scan, index) in
        real_time_portion.qr_scans" :key="index" :index="index"
        :reminder_time="qr_scan.reminder_time"
        v-on:remove-task="removeTask(index)" />
      </div>
      <div class="floated-right-container" id="async-portion-container">
        <h4>Async Portion</h4>
        <p>No async tasks</p>
      </div>
    </div>

    <div v-if="!course_has_loaded">
      <sui-loader active name="Loading Course" />
    </div>
    <div v-else id="right-section" class="inline-block">
      <h1>Schedule Meeting</h1>
      <div id="course-name">RCOS</div>
      <transition name="fade" mode="out-in">
        <sui-form v-if="show_main_form" class="form"">
          <div class="form-field">
            <sui-form-field required>
              <label class="form-label">Title</label>
              <input v-model="meeting.title">
            </sui-form-field>
          </div>
          <div class="mt-3">
            <sui-form-field required>
              <label>Select the sections for your meeting</label>
            </sui-form-field>
          </div>
          <div class="section-selectors mt-1">
            <div class="section-selector"
            v-for="section in course.sections" :key="section._id"
            @click="selectSection(section)"
            :id="`section${section.section_number}`">
              Section {{ section.section_number }}
            </div>
          </div>
          <h5 class="mt-3">Add tasks to your meeting</h5>
          <p>Tasks can also be added after your meeting is created</p>
          <sui-button @click.prevent="showRealTimePortionForm"
            animated size="large"
            style="background-color:#00b80c; color:white;
            margin-left:1rem; width:16rem;">
            <sui-button-content visible>
              Add real-time tasks
            </sui-button-content>
            <sui-button-content hidden>
              <sui-icon name="podcast" />
            </sui-button-content>
          </sui-button>
          <sui-button animated size="large"
            style="background-color:#00b80c; color:white;
            margin-left:1rem; margin-top:1rem; width:16rem;">
            <sui-button-content visible>
              Add asynchronous tasks
            </sui-button-content>
            <sui-button-content hidden>
              <sui-icon name="clock" />
            </sui-button-content>
          </sui-button>
          <sui-dropdown selection
          v-model="repeat_selection"
          :options="repeat_options" class="mt-3 ml-1" />
          <div v-if="repeat_selection == 3" class="mt-1 ml-1">
            <sui-dropdown
            multiple selection v-model="repeat_days_selection"
            :options="repeat_days" placeholder="Select days to repeat on"
            />
            <div class="mt-2">
              <sui-form-field>
                <label class="form-label">End Date</label>
                <input v-model="repeat_end_date" type="datetime-local">
              </sui-form-field>
            </div>
          </div>
          <div id="button-container" @click="createMeeting">
            <Button text="Schedule" color="blue" size="large" invert_colors
            wide/>
          </div>
        </sui-form>
        <RealTimePortionForm v-else
        :real_time_portion="real_time_portion"
        v-on:hide-form="hideRealTimePortionForm"
        v-on:add-task="addTask" />
      </transition>
    </div>
  </div>
</template>

<script>
import CourseAPI from '@/services/CourseAPI'
import MeetingAPI from '@/services/MeetingAPI'
import Button from '../components/Button';
import NewMeetingTaskCard from '@/components/NewMeetingTaskCard.vue';
import RealTimePortionForm from '@/components/RealTimePortionForm.vue';
import VueLottiePlayer from 'vue-lottie-player'

export default {
  name: 'NewMeeting',
  components: {
    NewMeetingTaskCard,
    Button,
    RealTimePortionForm,
    VueLottiePlayer
  },
  data () {
    return {
      course_id: "",
      course: {},
      course_has_loaded: false,
      meeting: {
        sections: [],
      },
      real_time_portion: {
        real_time_start: null,
        real_time_end: null,
        qr_scans: []
      },
      show_main_form: true,
      repeat_selection: 0,
      repeat_options: [
        {value: 0, text: "Does not repeat"}, 
        {value: 1, text: "Daily"}, 
        {value: 2, text: "Weekly"},
        {value: 3, text: "Custom Weekly"},
      ],
      repeat_days: [
        {value: 0, text: "Sunday"},
        {value: 1, text: "Monday"},
        {value: 2, text: "Tuesday"},
        {value: 3, text: "Wednesday"},
        {value: 4, text: "Thursday"},
        {value: 5, text: "Friday"},
        {value: 6, text: "Saturday"},
      ],
      repeat_days_selection: [],
      repeat_end_date: null,
      creating_meeting: false
    }
  },
  computed: {
    realTimePortionSet() {
      return this.real_time_portion.real_time_start != null
        && this.real_time_portion.real_time_end != null
    }
  },
  created () {
    this.getCourse()
  },
  methods: {
    async getCourse() {
      try {
        this.course_id = this.$route.params.course_id
        const response = await CourseAPI.getCourse(this.course_id)
        this.course = response.data
        this.course_has_loaded = true
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong")
      }
    },
    showRealTimePortionForm() {
      this.show_main_form = false
    },
    hideRealTimePortionForm() {
      this.show_main_form = true
    },
    clearRealTimePortion() {
      this.real_time_portion = {
        real_time_start: null,
        real_time_end: null,
        qr_scans: []
      }
    },
    addTask(task) {
      this.real_time_portion.qr_scans.push(task)
      this.hideRealTimePortionForm()
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
     for(let i = 0; i < this.meeting.sections.length; i++) {
       if(this.meeting.sections[i]
           === section._id){
         meeting_has_section = true
         index = i 
         break
       }
     }
     return [meeting_has_section, index]
    },
    addSectionToMeeting(section, section_container) {
     this.meeting.sections.push(section._id)
     section_container.classList.add("selected-section")
    },
    removeSectionFromMeeting(index, section_container) {
      this.meeting.sections.splice(index, 1);
      section_container.classList.remove("selected-section")
    },
    removeTask(index) {
      this.real_time_portion.qr_scans.splice(index,1)
    },
    async createMeeting() {
      try {
        this.creating_meeting = true
        let real_time_portion;
        if(this.realTimePortionSet &&
          this.real_time_portion.qr_scans.length > 0)
          real_time_portion = this.real_time_portion
        else
          real_time_portion = null
        console.log("Passing id", real_time_portion)
        const response = await MeetingAPI.addMeeting(this.meeting,
          real_time_portion, null, this.state_user._id)
        const saved_meeting = response.data
        this.$router.push({name: 'meeting_info', params: {meeting_id:
          saved_meeting._id}})        
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong creating your meeting")
        this.creating_meeting = false
      }
    },
  }
}
</script>

<style scoped>
#new-meeting {
  /*border: black solid;*/
  width: 88%;
  margin: auto;
  margin-top: 3rem;
  padding-bottom: 5rem;
}

.floated-right-container {
  display: inline-block;
  width: 100%;
}

#left-section {
  /*border: blue solid;*/
  width: 30%;
  height: 45rem;
}

#back-to-course-btn {
  /*border: black solid;*/
  margin-left: 2rem;
  margin-top: 1rem;
  display: inline-block;
  /*vertical-align: center;*/
}

#logo {
  height: 5rem;
  /*border: orange solid;*/
  float: right;
}

#real-time-portion-container {
  /*border: black solid;*/
  text-align: right;
  margin-top: 2.5rem;
}

#clear-btn-container {
  margin-right: 2rem;
}

#async-portion-container {
  /*border: red solid;*/
  margin-top: 2rem;
  text-align: right;
}

#right-section {
  /*padding-top: 6rem;*/
  /*border: green solid;*/
  width: 40%;
  text-align: center;
}

#course-name {
  font-size: 1.75rem;
}

.form .mt-3 {
  margin-top: 3rem;
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

#button-container {
  margin-top: 3rem;
  margin-left: 1rem;
}
</style>