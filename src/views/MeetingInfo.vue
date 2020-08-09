<template>
  <div>
    <div class="spinner-border" role="status" v-if="!meeting_has_loaded">
        <span class="sr-only">Loading...</span>
    </div>
    <div v-else>
      <!-- QR Code Modal -->
      <div class="hidden" id="qr_modal">
        <qrcode v-bind:value="current_qr_code" :options="{ width: 600 }"></qrcode>
        <button class="btn btn-secondary" id="close_qr_btn" @click="hideQRCode" aria-label="Hide QR">Hide</button>
      </div>
      <!-- QR SCanning Window -->
      <div id="qr-scanning-container" v-if="qr_scanning_window_open">
        <button @click="closeQRScanningWindow" id="exit_preview_btn" tabindex="0" aria-label="Close QR Scanner">X</button>
        <qrcode-stream id="video_preview" @decode="attemptQRCheckinSubmission"></qrcode-stream>
      </div>
      <!-- Meeting Info -->
      <h1>{{ meeting.title }}</h1>
      <h2 v-if="for_course">{{ meeting.course.name }}</h2>
      <h2 v-else>{{ meeting.org.name }}</h2>
      <h3 v-if="meeting.has_live_attendance">Has Live Attendance</h3>
      <h3 v-else>No Live Attendance</h3>
      <h3 v-if="meeting.has_async_attendance">Has Async Attendance</h3>
      <h3 v-else>No Async Attendance</h3>

      <!-- Live Attendance -->
      <h2 style="margin-top:5rem; text-decoration:underline;">Live Attendance</h2>
      <h3 style="text-decoration:underline;">QR Checkins</h3>
      <!-- Instructor QR Boxes -->
      <div v-if="is_instructor">
        <div  class="qr-checkin-box" v-for="qr_checkin in meeting.live_attendance.qr_checkins">
          <p style="font-weight:bold;" v-if="getCheckinWindowStatus(qr_checkin) === 'upcoming'">Upcoming</p>
          <button v-else-if="getCheckinWindowStatus(qr_checkin) === 'open'" @click="showQRCode(qr_checkin.code)">Show QR</button>
          <p style="font-weight:bold;" v-else>Closed</p>
          <h4>checkin start: {{ new Date(qr_checkin.qr_checkin_start_time) }}</h4>
          <h4>checkin end: {{ new Date(qr_checkin.qr_checkin_end_time) }}</h4>
          <h4 style="text-decoration:underline;">Submissions</h4>
          <h4 v-for="submission in qr_checkin.qr_checkin_submissions">
            <p>{{ submission.submitter.first_name }}</p>
            <p>{{ submission.submitter.last_name }}</p>
            <p>{{ submission.submitter.user_id }}</p>
          </h4>
        </div>
      </div>
      <!-- Student QR Boxes -->
      <div v-else>
        <div class="qr-checkin-box" v-for="qr_checkin in meeting.live_attendance.qr_checkins">
        <p v-if="getCheckinWindowStatus(qr_checkin) === 'closed'">QR Checkin Closed</p>
        <div v-else-if="getCheckinWindowStatus(qr_checkin) === 'open'">
          <button @click="showQRScanningWindow">Scan QR</button>
          <h4>checkin start: {{ new Date(qr_checkin.qr_checkin_start_time) }}</h4>
          <h4>checkin end: {{ new Date(qr_checkin.qr_checkin_end_time) }}</h4>
        </div>
        </div>
      </div>
      <h3 style="text-decoration:underline;">Live Polls</h3>

      <h2 style="margin-top:5rem; text-decoration:underline;">Async Attendance</h2>
      <h3>Recordings</h3>
    </div>
  </div>
</template>

<script>
  import MeetingAPI from '@/services/MeetingAPI.js';
  import qrcode from '@chenfengyuan/vue-qrcode';
  import { QrcodeStream } from 'vue-qrcode-reader'
  import LiveSubmissionAPI from '@/services/LiveSubmissionAPI.js';

  export default {
    name: 'MeetingInfo',
    components: {
      qrcode,
      QrcodeStream
    },
    data(){
      return {
        meeting: {},
        meeting_has_loaded: false,
        for_course: Boolean,
        checkin_window_open: false,
        current_qr_code: String,
        is_instructor: false,
        qr_scanning_window_open: false
      }
    },
    created() {
      this.is_instructor = this.$store.state.user.current_user.is_instructor
      this.getMeeting()
    },
    methods: {
      async getMeeting() {
        this.meeting_id = this.$route.params.meeting_id
        const response = await MeetingAPI.getMeeting(this.meeting_id)
        this.meeting = response.data
        this.for_course = this.meeting.for_course
        this.meeting_has_loaded = true
      },
      getCheckinWindowStatus(qr_checkin) {
        let current_time = new Date()
        let checkin_start = new Date(qr_checkin.qr_checkin_start_time)
        let checkin_end = new Date(qr_checkin.qr_checkin_end_time)
        let checkin_window_status = ""
        if(current_time > checkin_end)
          checkin_window_status = "closed"
        else if(current_time < checkin_start)
          checkin_window_status = "upcoming"
        else
          checkin_window_status = "open"
        return checkin_window_status
      },
      showQRCode(code) {
        this.current_qr_code = code
        document.getElementById("qr_modal").classList.remove("hidden")
      },
      hideQRCode() {
        document.getElementById("qr_modal").classList.add("hidden")
      },
      showQRScanningWindow() {
        this.qr_scanning_window_open = true
      },
      closeQRScanningWindow() {
        this.qr_scanning_window_open = false
      },
      isEmptyObj(obj) {
        return Object.keys(obj).length === 0 && obj.constructor === Object
      },
      attemptQRCheckinSubmission(scanned_code) {
        let open_checkin = this.getOpenQRCheckin()
        console.log("Open checkin", open_checkin)
        console.log("Open Checkin code", open_checkin.code)
        console.log("Scanned code", scanned_code)
        if(this.isEmptyObj(open_checkin))
          alert("No Open QR Checkins")
        else if(open_checkin.code === scanned_code)
          this.createLiveSubmission(open_checkin)
        else 
          alert("Scanned invalid code!")
        this.closeQRScanningWindow()
      },
      getOpenQRCheckin() {
        let open_checkin = {}
        let meeting_checkins = this.meeting.live_attendance.qr_checkins
        for(let i = 0; i < meeting_checkins.length; i++) {
          if(this.getCheckinWindowStatus(meeting_checkins[i]) === "open"){
            open_checkin = meeting_checkins[i]
            break
          }
        }
        return open_checkin
      },
      async createLiveSubmission(open_checkin) {
        let live_submission = {
          submitter: this.$store.state.user.current_user,
          is_qr_checkin_submission: true,
          qr_checkin: open_checkin,
          live_submission_time: new Date()
        }
        const response = await LiveSubmissionAPI.addLiveSubmission(live_submission)
        alert("Live Submission Recorded")
        this.$router.go()
      },
    }
  }
</script>

<style scoped>
.qr-checkin-box {
  border: black solid;
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.hidden {
  display: none;
}

#qr-scanning-container {
  position: absolute;
  width: 100%;
  height: 90%;
  top: 0;
  z-index: 1;
  background-color: white;
}

</style>