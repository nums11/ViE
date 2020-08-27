<template>
  <div>
    <!-- Live Attendance Modal -->
    <div class="attendance-modal" id="live-modal" v-if="is_live">
      <div class="attendance-modal-header">
        <button class="exit-modal-btn" @click="$emit('hide-attendance-modal')">X</button>
        <h2>Add Live Attendance</h2>
      </div>
      <form @submit.prevent="$emit('add-live-attendance',show_qr_checkin_inputs,qr_checkin)">
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
          <div v-if="!qr_checkin.has_random_checkin_time">
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
    <div class="attendance-modal" id="async-modal" v-else>
      <div class="attendance-modal-header">
        <button class="exit-modal-btn" @click="$emit('hide-attendance-modal')">X</button>
         <h2>Add Async Attendance</h2>
      </div>
      <form @submit.prevent="$emit('add-async-attendance',recording)" enctype="multipart/form-data">
        <input id="video_selector" name="recording" type="file" accept="video/*" class="btn" role="button" tabindex="0" aria-label="Select Video"/>
        <div v-if="file_selected">
          Video Preview
          <video id="video_preview" class="video-js vjs-default-skin" data-setup='{"fluid": true}' controls></video>
          <!-- Recording Submission Time Selectors -->
          <label id="'recording_submission_start_label">Recording Submission Start Time</label>
          <input id="'recording_submission_start" v-model="recording.recording_submission_start_time" aria-labelledby="recording_submission_start_time_label" type="datetime-local"/>
          <label id="'recordign_submission_end_label">Recording Submission End Time</label>
          <input id="'recording_submission_end" v-model="recording.recording_submission_end_time" aria-labelledby="recording_submission_end_time_label" type="datetime-local"/>
        </div>
        <button style="margin-top:2rem;" class="btn btn-primary">Add</button>
    </form>
    </div>
  </div>
</template>

<script>
import CourseAPI from "@/services/CourseAPI.js";
import MeetingAPI from "@/services/MeetingAPI.js";
import OrgAPI from "@/services/OrgAPI.js";
import videojs from 'video.js';
import SectionAPI from "@/services/SectionAPI.js";
import Sections from "@/components/Sections";
import flatpickr from "flatpickr";
import '../../node_modules/flatpickr/dist/flatpickr.min.css';
require("flatpickr/dist/themes/material_blue.css");

export default {
  name: "AddAttendanceModal",
  data() {
    return {
      show_qr_checkin_inputs: false,
      show_live_poll_inputs: false,
      qr_checkin: {
        has_random_checkin_time: true
      },
      recording: {
        video: null
      },
      recording_video_vjs: null,
      file_selected: false
    }
  },
  props: {
    is_live: {
      type: Boolean,
      default: false
    }
  },
  created() {
    if(!this.is_live)
      this.addVideoSelectionListener()
  },
  computed: {
    // TODO: Update this to handle the custom checkin time windows
    disableAddLiveButton: function () {
      return !this.show_qr_checkin_inputs && !this.show_live_poll_inputs
    },
    disableAddAsyncButton: function () {
      return !this.file_selected
    }
  },
  methods: {
    addVideoSelectionListener() {
      let self = this
      this.$nextTick(() => {
        let video_selector = document.getElementById("video_selector");
        video_selector.addEventListener("change", () => {
          if (video_selector.files.length == 0) {
            // vid_upload_btn.setAttribute("disabled","true");
            self.file_selected = false;
            self.recording.video = null
            self.recording_video_vjs = {}
          } else {
            self.file_selected = true;
            self.$nextTick(() => {
              if(self.recording_video == null) {
                videojs("video_preview", {}, function() {
                  self.recording.video = video_selector.files[0]
                  self.recording_video_vjs = this
                  console.log(self.recording.video)
                  self.recording_video_vjs.src({ type: video_selector.files[0].type, src: URL.createObjectURL(video_selector.files[0]) })
                  self.recording_video_vjs.load()
                })
              } else {
                self.recording_video_vjs.src({ type: video_selector.files[0].type, src: URL.createObjectURL(video_selector.files[0]) })
                self.recording_video_vjs.load()
              }
            })
          }
        })
      })
    },
    showQRCheckinInputs() {
      this.show_qr_checkin_inputs = true
      this.show_live_poll_inputs = false
    },
    showLivePollInputs() {
      this.show_live_poll_inputs = true
      this.show_qr_checkin_inputs = false
    },
    useRandomCheckinTime() {
      this.qr_checkin.has_random_checkin_time = true
    },
    useCustomCheckinTime() {
      this.qr_checkin.has_random_checkin_time = false
      // this.setQRCheckinDateInputs()
    }
    // setQRCheckinDateInputs() {
    //   console.log("In this function")
    //   // this.$nextTick(() => {
    //     let self = this
    //   setTimeout(() => {
    //     console.log(document.getElementById("submission_start"))
    //     let submission_start_picker = flatpickr(document.getElementById("submission_start"),{
    //       enableTime: true,
    //       dateFormat: "h:i K, M d, Y",
    //       minDate: Date.now(),
    //       minuteIncrement: 1,
    //       onChange: function(selectedDates, dateStr, instance) {
    //         self.qr_checkin.qr_checkin_start_time = Date.parse(dateStr)
    //         // Set the new min end time to 5 minutes after the new start time
    //         let new_min_end_time = new Date(self.meeting.start_time)
    //         new_min_end_time.setMinutes(new_min_end_time.getMinutes() + 5)
    //         submission_end_picker.set("minDate",new_min_end_time)
    //         // Update end time if invalid
    //         let five_mins = 60 * 5 * 1000
    //         if(self.qr_checkin.qr_checkin_start_time > self.qr_checkin.qr_checkin_end_time || !self.qr_checkin.qr_checkin_end_time) {
    //           self.qr_checkin.qr_checkin_end_time = Date.parse(dateStr)
    //           submission_end_picker.setDate(self.qr_checkin.qr_checkin_start_time + five_mins)
    //         }
    //         // Keep the dates 5 minutes apart
    //         if((self.qr_checkin.qr_checkin_start_time + five_mins) > self.qr_checkin.qr_checkin_end_time) {
    //           submission_end_picker.setDate(self.qr_checkin.qr_checkin_start_time + five_mins)
    //         }
    //         self.qr_checkin_times_are_valid = true
    //       }
    //     })
    //     let submission_end_picker = flatpickr(document.getElementById("submission_end"),{
    //       enableTime: true,
    //       dateFormat: "h:i K, M d, Y",
    //       minDate: Date.now(),
    //       minuteIncrement: 1,
    //       onChange: function(selectedDates, dateStr, instance) {
    //         self.qr_checkin.qr_checkin_end_time = Date.parse(dateStr)
    //       }
    //     })
    //   }, 3000)
    //   // })
    // }
  }
};
</script>

<style scoped>
.attendance-modal {
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
}

.attendance-modal-header {
  height: 10%;
}

.exit-modal-btn {
  float: left;
}

#video_preview {
  margin:auto;
  border:black solid;
  width: 70%;
  /*width: 100%;*/
}
</style>