<template>
  <!-- ADDING USER -->
  <div>
    <h1 v-if="for_course">New Meeting For {{ course.name }}</h1>
    <h1 v-else>New Meeting For {{ org.name }}</h1>

    <!-- Live Attendance Modal -->
    <div class="attendance-modal" id="live-modal" v-if="show_live_attendance_modal">
      <div class="attendance-modal-header">
        <button class="exit-modal-btn" @click="hideLiveAttendanceModal">X</button>
        <h2>Add Live Attendance</h2>
      </div>
      <form @submit.prevent="addLiveAttendance">
        <!-- Attendance Type Radio Buttons -->
        <p>Attendance Type</p>
        <input @click="showQRCheckinInputs" type="radio" id="qr_checkin" name="live_attendance_type" value="qr_checkin">
        <label for="qr_checkin">QR Checkin</label><br>
        <input @click="showLivePollInputs" type="radio" id="live_poll" name="live_attendance_type" value="live_poll">
        <label for="live_poll">Live Poll</label><br>
        <div v-if="show_qr_checkin_inputs">
          <!-- QR Checkin Time Type Radio Buttons -->
          <div class="input-wrapper">
            <input @click="useRandomCheckinTime" type="radio" id="random_time" name="qr_checkin_time_type" checked />
            <label for="random_time">Use randomized check-in time</label><br>
            <input @click="useCustomCheckinTime" type="radio" id="custom_time" name="qr_checkin_time_type" />
            <label for="custom_times">Use custom check-in time</label><br>
          </div>
          <div v-if="!random_checkin_time">
            <label id="'submission_start_label">Submission Start Time</label>
            <input id="'submission_start" v-model="qr_checkin.qr_checkin_start_time" aria-labelledby="submission_start_time_label" type="datetime-local"/>
            <label id="'submission_end_label">Submission End Time</label>
            <input id="'submission_end" v-model="qr_checkin.qr_checkin_end_time" aria-labelledby="submission_end_time_label" type="datetime-local"/>
          </div>
        </div>
        <div v-else-if="show_live_poll_inputs">
          Poll stuff
        </div>
        <button style="margin-top:2rem;" class="btn btn-primary" :disabled="disableAddLiveButton">Add</button>
      </form>
    </div>

    <!-- Async Attendance Modal -->
    <div class="attendance-modal" id="async-modal" v-if="show_async_attendance_modal">
      <div class="attendance-modal-header">
        <button class="exit-modal-btn" @click="hideAsyncAttendanceModal">X</button>
        <h2>Add Async Attendance</h2>
      </div>
    </div>

    <!-- New Meeting Form -->
    <form class="new-lecture-form" @submit.prevent="createMeeting">
      <div class="form-group">
        <!-- Meeting Info -->
        <div class="input-wrapper">
          <label id="title_label">Meeting Title</label>
          <input
            type="text"
            class="form-control new-lecture-input"
            placeholder="e.g. Meeting 1"
            v-model="lecture.title"
            aria-labelledby="title_label"
            :tabindex="(modal_open ? '-1' : '0')"
          />
        </div>

        <!-- Sections selection -->
        <Sections v-if="for_course" v-bind:sections="course.sections" v-on:select-section="addSectionToMeeting" :disable_tabbing="(modal_open ? true : false)"/>
        <div class="input-wrapper">
          <label>Section(s):</label>
          <input v-for="(section,i) in meeting.sections" :key="i" type="text" class="form-control new-lecture-input" v-model="section.number" readonly :tabindex="(modal_open ? '-1' : '0')"/>
        </div>

        <!-- Start & End Time Inputs -->
        <div class="input-wrapper">
          <label id="start_time_label">Start Time</label>
          <input id="meeting_start" aria-labelledby="start_time_label" type="datetime-local"/>
          <br>
          <label id="end_time_label">End Time</label>
          <input id="meeting_end"aria-labelledby="end_time_label" type="datetime-local"/>
        </div>

        <!-- Live Attendance Button & Info -->
        <div class="input-wrapper">
          <button type="button" class="btn btn-secondary" @click="showLiveAttendanceModal" :disabled="!meeting_times_are_valid">Add Live Attendance</button>
        </div>

        <div class="input-wrapper">
          <div style="border:black solid; margin:auto; margin-top:1rem;width:70%; height: 5rem; border-radius:5px;" v-for="qr_checkin in qr_checkins">
            <p>Start: {{new Date(qr_checkin.qr_checkin_start_time)}}</p>
            <p>End: {{new Date(qr_checkin.qr_checkin_end_time)}}</p>
          </div>
        </div>

        <!-- Async Attendance Button & Info -->
        <div class="input-wrapper">
          <button type="button" class="btn btn-secondary" @click="showAsyncAttendanceModal" :disabled="!meeting_times_are_valid">Add Asynchronous Attendance</button>
        </div>

        <!-- Error Mesage and Create Meeting Button -->
        <p class="error_msg" v-if="input_error_message!=''">{{input_error_message}}</p>
        <button class="btn btn-primary create-lecture-btn" :tabindex="(modal_open ? '-1' : '0')" :disabled="true">Create Meeting</button>
      </div>
    </form>
  </div>
</template>

<script>
import LectureAPI from "@/services/LectureAPI.js";
import CourseAPI from "@/services/CourseAPI.js";
import MeetingAPI from "@/services/MeetingAPI.js";
import OrgAPI from "@/services/OrgAPI.js";
import SectionAPI from "@/services/SectionAPI.js";
import Sections from "@/components/Sections";
import QRCode from "qrcode";
import GoogleMap from "@/components/GoogleMap";
import LectureUploadModal from "@/components/LectureUploadModal";
import flatpickr from "flatpickr";
import '../../node_modules/flatpickr/dist/flatpickr.min.css';
require("flatpickr/dist/themes/material_blue.css");
// DatePicker themes options:
// "material_blue","material_green","material_red","material_orange",
// "dark","airbnb","confetti"

export default {
  name: "NewLecture",
  components: {
    Sections,
    GoogleMap
  },
  data() {
    return {
      meeting: {
        has_live_attendance: false,
        has_async_attendance: false,
        sections: []
      },
      meeting_times_are_valid: false,
      qr_checkin_times_are_valid: false,
      course: {},
      org: {},
      lecture: {},
      course_sections: [],
      course_sections_have_loaded: false,
      selected_geofence: [],
      allow_live_submissions: false,
      allow_playback_submissions: false,
      checkins: [],
      checkin_pickers: [],
      random_checkins: [],
      times_added: 0,
      random_times: true,
      custom_times: false,
      random_checkin_count: 1,
      random_checkin_length: 5,
      input_error_message: "",
      modal_open: false,
      for_course: false,
      show_live_attendance_modal: false,
      show_async_attendance_modal: false,
      show_qr_checkin_inputs: false,
      show_live_poll_inputs: false,
      random_checkin_time: true,
      qr_checkins: [],
      live_polls: [],
      qr_checkin: {}
    };
  },
  computed: {
    // TODO: Update this to handle the custom checkin time windows
    disableAddLiveButton: function () {
      return !this.show_qr_checkin_inputs && !this.show_live_poll_inputs
    }
  },
  created() {
    this.getCourseOrOrg()
    this.setDateInputs()
  },
  methods: {
    async getCourseOrOrg() {
      if(this.$route.name === "course_new_meeting"){
        this.course_id = this.$route.params.course_id;
        this.for_course = true
        const response = await CourseAPI.getCourse(this.course_id)
        this.course = response.data
      } else {
        this.org_id = this.$route.params.org_id;
        const response = await OrgAPI.getOrg(this.org_id)
        this.org = response.data
      }
    },
    setDateInputs() {
      this.$nextTick(() => {
        let self = this
        let start_time_picker = flatpickr(document.getElementById("meeting_start"),{
          enableTime: true,
          dateFormat: "h:i K, M d, Y",
          minDate: Date.now(),
          minuteIncrement: 1,
          onChange: function(selectedDates, dateStr, instance) {
            self.meeting.start_time = Date.parse(dateStr)
            // Set the new min end time to 15 minutes after the new start time
            let new_min_end_time = new Date(self.meeting.start_time)
            new_min_end_time.setMinutes(new_min_end_time.getMinutes() + 15)
            end_time_picker.set("minDate",new_min_end_time)
            // Update end time if invalid
            let fifteen_mins = 60 * 15 * 1000
            if(self.meeting.start_time > self.meeting.end_time || !self.meeting.end_time ) {
              self.meeting.end_time = Date.parse(dateStr)
              end_time_picker.setDate(self.meeting.start_time + fifteen_mins)
            }
            // Keep the dates 15 minutes apart
            if((self.meeting.start_time + fifteen_mins) > self.meeting.end_time) {
              end_time_picker.setDate(self.meeting.start_time + fifteen_mins)
            }
            self.meeting_times_are_valid = true
          }
        })
        let end_time_picker = flatpickr(document.getElementById("meeting_end"),{
          enableTime: true,
          dateFormat: "h:i K, M d, Y",
          minDate: Date.now(),
          minuteIncrement: 1,
          onChange: function(selectedDates, dateStr, instance) {
            self.meeting.end_time = Date.parse(dateStr)
          }
        })
      })
    },
    setQRCheckinDateInputs() {
      console.log("In this function")
      // this.$nextTick(() => {
        let self = this
      setTimeout(() => {
        console.log(document.getElementById("submission_start"))
        let submission_start_picker = flatpickr(document.getElementById("submission_start"),{
          enableTime: true,
          dateFormat: "h:i K, M d, Y",
          minDate: Date.now(),
          minuteIncrement: 1,
          onChange: function(selectedDates, dateStr, instance) {
            self.qr_checkin.qr_checkin_start_time = Date.parse(dateStr)
            // Set the new min end time to 5 minutes after the new start time
            let new_min_end_time = new Date(self.meeting.start_time)
            new_min_end_time.setMinutes(new_min_end_time.getMinutes() + 5)
            submission_end_picker.set("minDate",new_min_end_time)
            // Update end time if invalid
            let five_mins = 60 * 5 * 1000
            if(self.qr_checkin.qr_checkin_start_time > self.qr_checkin.qr_checkin_end_time || !self.qr_checkin.qr_checkin_end_time) {
              self.qr_checkin.qr_checkin_end_time = Date.parse(dateStr)
              submission_end_picker.setDate(self.qr_checkin.qr_checkin_start_time + five_mins)
            }
            // Keep the dates 5 minutes apart
            if((self.qr_checkin.qr_checkin_start_time + five_mins) > self.qr_checkin.qr_checkin_end_time) {
              submission_end_picker.setDate(self.qr_checkin.qr_checkin_start_time + five_mins)
            }
            self.qr_checkin_times_are_valid = true
          }
        })
        let submission_end_picker = flatpickr(document.getElementById("submission_end"),{
          enableTime: true,
          dateFormat: "h:i K, M d, Y",
          minDate: Date.now(),
          minuteIncrement: 1,
          onChange: function(selectedDates, dateStr, instance) {
            self.qr_checkin.qr_checkin_end_time = Date.parse(dateStr)
          }
        })
      }, 3000)
      // })
    },
    showLiveAttendanceModal() {
      this.show_live_attendance_modal = true
    },
    showAsyncAttendanceModal() {
      this.show_async_attendance_modal = true
    },
    hideLiveAttendanceModal() {
      this.show_live_attendance_modal = false
      this.show_qr_checkin_inputs = false
      this.show_live_poll_inputs = false
      this.random_checkin_time = true
    },
    hideAsyncAttendanceModal() {
      this.show_async_attendance_modal = false
    },
    showQRCheckinInputs() {
      this.show_qr_checkin_inputs = true
      this.show_live_poll_inputs = false
    },
    showLivePollInputs() {
      this.show_live_poll_inputs = true
      this.show_qr_checkin_inputs = false
    },
    showLivePollInputs() {
      this.show_live_poll_inputs = true
      this.show_qr_checkin_inputs = false
    },
    useRandomCheckinTime() {
      this.random_checkin_time = true
    },
    useCustomCheckinTime() {
      this.random_checkin_time = false
      // this.setQRCheckinDateInputs()
    },
    addLiveAttendance() {
      let is_qr_checkin = this.show_qr_checkin_inputs
      this.show_live_attendance_modal = false
      this.show_qr_checkin_inputs = false
      this.show_live_poll_inputs = false
      if(is_qr_checkin) {
        if(this.random_checkin_time) {
          // Calculate a random time
          console.log("Calculating a random time")
        } else {
          console.log("Using custom time")
        }
        this.qr_checkin.code = this.generateRandomCode()
        this.qr_checkins.push(this.qr_checkin)
        this.qr_checkin = {}
        console.log("qr checkins", this.qr_checkins)
      } else {

      }
      this.random_checkin_time = true
      this.meeting.has_live_attendance = true
    },
    generateRandomCode() {
      const alnums = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let result = "";
      for (let i = 100; i > 0; --i) {
        result += alnums[Math.floor(Math.random() * alnums.length)];
      }
      return result;
    },
    addSectionToMeeting(section) {
      if(!this.meeting.sections.includes(section))
        this.meeting.sections.push(section)
    },
    async createMeeting() {
      console.log("meeting",this.meeting)
     if(!this.meeting.has_live_attendance && !this.meeting.has_async_attendance) {
      console.log("Error. Need Live or async attendance")
      return
     } 
    }
  }
};
</script>

<style>
.attendance-modal {
  border: black solid;
  background-color: white;
  z-index: 10;
  height: 90%;
  width: 80%;
  position: absolute;
  margin-top: 0;
  margin-left: 10%;
}

.attendance-modal-header {
  border: blue solid;
  height: 10%;
}

.exit-modal-btn {
  float: left;
}

.input-wrapper {
  width: 80%;
  margin: auto;
  margin-top: 3rem;
  padding: 0;
  /*border: blue solid;*/
}

.form-group {
  margin: 0;
}

.random_input {
  width: 5rem;
}

#submission-time-wrapper {
  width: 80%;
}

.time-picker {
  /*border: black solid;*/
  display: inline-block;
  margin-left: 1rem;
  margin-right: 1rem;
}

.create-lecture-btn {
  margin-top: 2rem;
}

#qr-section {
  margin-top: 2rem;
}

.error_msg {
  color: red;
}
</style>