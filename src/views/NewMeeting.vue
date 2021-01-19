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
      <NewMeetingPortionContainer :real_time_portion="real_time_portion"
      v-on:clear-portion="clearPortion"
      v-on:remove-task="removeTask('qr_scan', ...arguments)" />
      <NewMeetingPortionContainer :async_portion="async_portion"
      v-on:clear-portion="clearPortion"
      v-on:remove-task="removeTask('video', ...arguments)" />
    </div>

    <div v-if="!course_has_loaded">
      <sui-loader active name="Loading Course" />
    </div>
    <div v-else id="right-section" class="inline-block">
      <h1>Schedule Meeting</h1>
      <div id="course-name">RCOS</div>
      <sui-form class="form"">
        <div class="form-field">
          <sui-form-field required>
            <label class="form-label">Title</label>
            <input v-model="meeting.title">
          </sui-form-field>
        </div>
        <h5 class="mt-3">Add tasks to your meeting</h5>
        <p>Tasks can also be added after your meeting is created</p>
        <sui-button @click.prevent="showAddTaskModal('real-time')"
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
        <sui-button @click.prevent="showAddTaskModal('async')"
          animated size="large"
          style="background-color:#00b80c; color:white;
          margin-left:1rem; margin-top:1rem; width:16rem;">
          <sui-button-content visible>
            Add asynchronous tasks
          </sui-button-content>
          <sui-button-content hidden>
            <sui-icon name="clock" />
          </sui-button-content>
        </sui-button>
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
          wide :disabled="!formComplete" />
        </div>
      </sui-form>
      <AddTaskModal ref="RealTimeModal"
      :real_time_portion="real_time_portion"
      :async_portion="async_portion"
      v-on:add-task="addTask('qr_scan', ...arguments)" />
      <AddTaskModal ref="AsyncModal"
      :async_portion="async_portion"
      v-on:add-task="addTask('video', ...arguments)" />
    </div>
  </div>
</template>

<script>
import CourseAPI from '@/services/CourseAPI'
import MeetingAPI from '@/services/MeetingAPI'
import Button from '../components/Button';
import AddTaskModal from '@/components/AddTaskModal.vue';
import NewMeetingPortionContainer from
'@/components/NewMeetingPortionContainer.vue';
import VueLottiePlayer from 'vue-lottie-player'

export default {
  name: 'NewMeeting',
  components: {
    Button,
    AddTaskModal,
    VueLottiePlayer,
    NewMeetingPortionContainer
  },
  data () {
    return {
      value: 1,
      course_id: "",
      course: {},
      course_has_loaded: false,
      meeting: {
        title: "",
        sections: [],
      },
      real_time_portion: {
        real_time_start: null,
        real_time_end: null,
        qr_scans: []
      },
      async_portion: {
        async_start: null,
        async_end: null,
        videos: []
      },
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
    formComplete() {
      return this.meeting.title !== '' &&
      this.meeting.sections.length > 0
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
    showAddTaskModal(task_type) {
      if(task_type === 'real-time')
        this.$refs.RealTimeModal.showModal()
      else if(task_type === 'async')
        this.$refs.AsyncModal.showModal()
    },
    clearPortion(is_real_time) {
      if(is_real_time) {
        this.real_time_portion.real_time_start = null
        this.real_time_portion.real_time_end = null
        this.real_time_portion.qr_scans = []
        this.$refs.RealTimeModal.clearDateTimePicker()
      } else {
        this.async_portion.async_start = null
        this.async_portion.async_end = null
        this.async_portion.videos = []
        this.$refs.AsyncModal.clearDateTimePicker()
      }
    },
    addTask(task_type, task) {
      if(task_type === 'qr_scan')
        this.real_time_portion.qr_scans.push(task)
      else
        this.async_portion.videos.push(task)
    },
    selectSection(section) {
     let [meeting_has_section, index] = this.meetingHasSection(section)
     let section_container = this.getSectionContainer(
      section.section_number)
     if(meeting_has_section)
       this.removeSectionFromMeeting(index, section_container)
     else {
       this.addSectionToMeeting(section, section_container)
     }
    },
    getSectionContainer(section_number) {
      return document.getElementById(`section${section_number}`)
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
     this.addSelectedClassToContainer(section_container)
    },
    addSelectedClassToContainer(section_container) {
     section_container.classList.add("selected-section")
    },
    removeSectionFromMeeting(index, section_container) {
      this.meeting.sections.splice(index, 1);
      section_container.classList.remove("selected-section")
    },
    removeTask(task_type, index) {
      if(task_type === 'qr_scan')
        this.real_time_portion.qr_scans.splice(index,1)
      else
        this.async_portion.videos.splice(index,1)
    },
    portionTimesSet(is_real_time) {
      if(is_real_time) {
        return (this.real_time_portion.real_time_start != null
          && this.real_time_portion.real_time_end != null)
      } else {
        return (this.async_portion.async_start != null
          && this.async_portion.async_end != null)
      }
    },
    async createMeeting() {
      if(!this.formComplete)
        return

      try {
        this.creating_meeting = true
        let real_time_portion;
        let async_portion;
        if(this.portionTimesSet(true))
          real_time_portion = this.real_time_portion
        else
          real_time_portion = null
        if(this.portionTimesSet(false))
          async_portion = this.async_portion
        else
          async_portion = null
        if(async_portion != null){
          const videos_with_urls = await this.saveVideosToGCS()
          if(videos_with_urls == null)
            throw "Error saving videos to GCS"
          async_portion.videos = videos_with_urls
        }
        const response = await MeetingAPI.addMeeting(this.meeting,
          real_time_portion, async_portion, this.state_user._id)
        const saved_meeting = response.data
        this.$router.push({name: 'meeting_info', params: {meeting_id:
          saved_meeting._id}})        
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong creating your meeting")
        this.creating_meeting = false
      }
    },
    async saveVideosToGCS() {
      try {
        let video_promises = []
        this.async_portion.videos.forEach(video => {
          video_promises.push(new Promise(async (resolve, reject) => {
            try {
              const response =
                await MeetingAPI.saveVideoToGCS(video.video_file)
              const video_url = response.data
              video.url = video_url
              resolve(video)
            } catch(error) {
              reject(error)
            }
          }))
        })
        const videos_with_urls = await Promise.all(video_promises)
        return videos_with_urls
      } catch(error) {
        console.log(error)
        return null
      }
    }
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