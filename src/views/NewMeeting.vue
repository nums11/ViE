<template>
  <!-- ADDING USER -->
  <div class="new-meeting-form">
    <div id="meeting-saving-modal" v-if="meeting_saving">
      <h1>Please wait while we schedule your meeting...</h1>
    </div>

    <h1 v-if="for_course">New Meeting For {{ course.name }}</h1>
    <h1 v-else>New Meeting For {{ org.name }}</h1>

    <AddAttendanceModal v-if="show_live_attendance_modal" is_live v-on:hide-attendance-modal="hideAttendanceModal" v-on:add-live-attendance="addLiveAttendance"/>
    <AddAttendanceModal v-if="show_async_attendance_modal" v-on:hide-attendance-modal="hideAttendanceModal" v-on:add-async-attendance="addAsyncAttendance"/>

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
            v-model="meeting.title"
            aria-labelledby="title_label"
          />
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

        <AttendanceContainerList :attendance_list="qr_checkins" :is_qr="true" v-on:remove-attendance="removeAttendance"/>

        <!-- Async Attendance Button & Info -->
        <div class="input-wrapper">
          <button type="button" class="btn btn-secondary" @click="showAsyncAttendanceModal" :disabled="!meeting_times_are_valid">Add Asynchronous Attendance</button>
        </div>

        <AttendanceContainerList :attendance_list="recordings" :is_qr="false" v-on:remove-attendance="removeAttendance"/>

        <!-- Error Mesage and Create Meeting Button -->
        <!-- <p class="error_msg" v-if="input_error_message!=''">{{input_error_message}}</p> -->
        <button class="btn btn-primary create-lecture-btn" :disabled="!meetingCanBeCreated">Create Meeting</button>
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
import AddAttendanceModal from "@/components/AddAttendanceModal";
import AttendanceContainerList from "@/components/AttendanceContainerList";
import flatpickr from "flatpickr";
import '../../node_modules/flatpickr/dist/flatpickr.min.css';
require("flatpickr/dist/themes/material_blue.css");
// DatePicker themes options:
// "material_blue","material_green","material_red","material_orange",
// "dark","airbnb","confetti"

export default {
  name: "NewMeeting",
  components: {
    Sections,
    GoogleMap,
    AddAttendanceModal,
    AttendanceContainerList
  },
  data() {
    return {
      meeting: {
        has_live_attendance: false,
        has_async_attendance: false,
        sections: []
      },
      show_live_attendance_modal: false,
      show_async_attendance_modal: false,
      meeting_times_are_valid: false,
      qr_checkin_times_are_valid: false,
      course: {},
      org: {},
      random_checkin_time: true,
      qr_checkins: [],
      recordings: [],
      live_polls: [],
      for_course: false,
      meeting_saving: false
    };
  },
  created() {
    this.getCourseOrOrg()
    this.setDateInputs()
  },
  computed: {
    meetingCanBeCreated: function() {
      return (this.meeting.has_live_attendance || this.meeting.has_async_attendance) && this.meeting.title && !this.meeting_saving
    }
  },
  methods: {
    async getCourseOrOrg() {
      if(this.$route.name === "course_new_meeting"){
        this.course_id = this.$route.params.course_id;
        this.for_course = true
        const response = await CourseAPI.getCourse(this.course_id)
        this.course = response.data
        this.meeting.for_course = true
        this.meeting.course = this.course
      } else {
        this.org_id = this.$route.params.org_id;
        const response = await OrgAPI.getOrg(this.org_id)
        this.org = response.data
        this.meeting.for_course = false
        this.meeting.org = this.org
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
              self.meeting.end_time = self.meeting.start_time + fifteen_mins
              end_time_picker.setDate(self.meeting.start_time + fifteen_mins)
            }
            // Keep the dates 15 minutes apart
            if((self.meeting.start_time + fifteen_mins) > self.meeting.end_time) {
              self.meeting.end_time = self.meeting.start_time + fifteen_mins
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
    showLiveAttendanceModal() {
      this.show_live_attendance_modal = true
    },
    showAsyncAttendanceModal() {
      this.show_async_attendance_modal = true
    },
    hideAttendanceModal() {
      this.show_live_attendance_modal = false
      this.show_async_attendance_modal = false
    },
    addLiveAttendance(is_qr_checkin, qr_or_poll) {
      this.hideAttendanceModal()
      if(is_qr_checkin) {
        let qr_checkin = qr_or_poll
        if(qr_checkin.has_random_checkin_time) {
          // Generate a random start time within the window
          // 5 mins after start and 5 mins before end
          this.generateRandomCheckinTimes(qr_checkin)
        } else {
          console.log("Using custom time for qr",qr_checkin)
        }
        qr_checkin.code = this.generateRandomCode()
        this.qr_checkins.push(qr_checkin)
      } else {

      }
      this.meeting.has_live_attendance = true
    },
    addAsyncAttendance(recording) {
      if(this.recordingExists(recording)) {
        alert("Recording with this video has already been added")
      } else {
        this.hideAttendanceModal()
        this.recordings.push(recording)
        this.meeting.has_async_attendance = true
      }
    },
    recordingExists(recording) {
      let recording_exists = false
      for(let i = 0; i < this.recordings.length; i++) {
        if(this.recordings[i].video.name === recording.video.name) {
          recording_exists = true
          break
        }
      }
      return recording_exists
    },
    generateRandomCheckinTimes(qr_checkin) {
      let five_mins = 60 * 5 * 1000
      let five_mins_after_start = new Date(this.meeting.start_time + five_mins)
      let five_mins_before_end = new Date(this.meeting.end_time - five_mins)
      qr_checkin.qr_checkin_start_time = new Date(five_mins_after_start.getTime() + Math.random() *
          (five_mins_before_end.getTime() - five_mins_after_start.getTime()))
      qr_checkin.qr_checkin_end_time = new Date(qr_checkin.qr_checkin_start_time.getTime() + five_mins)
    },
    generateRandomCode() {
      const alnums = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let result = "";
      for (let i = 100; i > 0; --i) {
        result += alnums[Math.floor(Math.random() * alnums.length)];
      }
      return result;
    },
    removeAttendance(attendance, is_qr) {
      if(is_qr) {
        for(let i = 0; i < this.qr_checkins.length; i++) {
          if(this.qr_checkins[i].code === attendance.code)
            this.qr_checkins.splice(i,1)
        }
        if(this.qr_checkins.length == 0)
          this.meeting.has_live_attendance = false
      } else {
        for(let i = 0; i < this.recordings.length; i++) {
          if(this.recordings[i].video.name === attendance.video.name)
            this.recordings.splice(i,1)
        }
        if(this.recordings.length == 0)
          this.meeting.has_async_attendance = false 
      }
    },
    async createMeeting() {
      this.meeting_saving = true
      if(this.meeting.has_live_attendance)
        this.meeting.qr_checkins = this.qr_checkins
      if(this.meeting.has_async_attendance) 
        await this.saveRecordingVideosToGCS()
      await this.saveMeetingToCourseOrOrg()
      this.meeting_saving = false
      this.routeToCourseOrOrgInfo()
    },
    async saveRecordingVideosToGCS() {
      const response = await MeetingAPI.saveRecordingVideosToGCS(this.recordings)
      let video_gcs_urls = response.data
      console.log("video_gcs_urls", video_gcs_urls)
      for(let i = 0; i < this.recordings.length; i++) {
        this.recordings[i].video_url = video_gcs_urls[i]
        console.log("Set url",this.recordings[i].video_url)
      }
      this.meeting.recordings = this.recordings
    },
    async saveMeetingToCourseOrOrg() {
      console.log("saving meeting",this.meeting)
      if(this.for_course){
        const response = await MeetingAPI.addMeeting(this.meeting,true,this.course_id)
      }else{
        const response = await MeetingAPI.addMeeting(this.meeting,false,this.org_id)
      }
    },
    routeToCourseOrOrgInfo() {
      if(this.$route.name === "course_new_meeting"){
        this.$router.push({
          name: "course_info",
          params: { id: this.course_id }
        })
      } else {
        this.$router.push({
          name: "org_info",
          params: { id: this.org_id }
        })
      }
    }
  }
};
</script>

<style>
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

#meeting-saving-modal {
  border: black solid;
  background-color: white;
  z-index: 10;
  height: 90%;
  width: 80%;
  position: absolute;
  margin-top: 0;
  margin-left: 10%;
  overflow-y: scroll;
  margin-bottom: 5rem;
  padding-top: 15rem;
}
</style>