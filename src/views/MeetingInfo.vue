<template>
  <div>
    <div class="spinner-border" role="status" v-if="!meeting_has_loaded">
        <span class="sr-only">Loading...</span>
    </div>
    <div v-else>
      <!-- Meeting Info -->
      <h1>{{ meeting.title }}</h1>
      <h2 v-if="for_course">{{ meeting.course.name }}</h2>
      <h2 v-else>{{ meeting.org.name }}</h2>

      <div v-if="meeting.has_live_attendance">
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
        <!-- Live Attendance -->
        <h2 style="margin-top:5rem; text-decoration:underline;">Live Attendance</h2>
        <h3 style="text-decoration:underline;">QR Checkins</h3>
        <!-- Instructor QR Boxes -->
        <div v-if="is_instructor">
          <div class="attendance-box" v-for="qr_checkin in meeting.live_attendance.qr_checkins">
            <p style="font-weight:bold;" v-if="getWindowStatus(qr_checkin, true) === 'upcoming'">Upcoming</p>
            <button v-else-if="getWindowStatus(qr_checkin, true) === 'open'" @click="showQRCode(qr_checkin.code)">Show QR</button>
            <p style="font-weight:bold;" v-else>Closed</p>
            <h4>checkin start: {{ new Date(qr_checkin.qr_checkin_start_time) }}</h4>
            <h4>checkin end: {{ new Date(qr_checkin.qr_checkin_end_time) }}</h4>
            <h4 style="text-decoration:underline;">Submissions</h4>
            <h4 v-for="submission in qr_checkin.qr_checkin_submissions">
              <p>
                {{ submission.submitter.first_name }} {{ submission.submitter.last_name }} ({{ submission.submitter.user_id }})
              </p>
            </h4>
          </div>
        </div>
        <!-- Student QR Boxes -->
        <div v-else>
          <div class="attendance-box" v-for="qr_checkin in meeting.live_attendance.qr_checkins">
          <p v-if="getWindowStatus(qr_checkin, true) === 'closed'">QR Checkin Closed</p>
          <div v-else-if="getWindowStatus(qr_checkin, true) === 'open'">
            <button v-if="!submissionExistsForUser(qr_checkin)" @click="showQRScanningWindow">Scan QR</button>
            <p style="font-weight:bold;" v-else>Attendance Recorded</p>
            <h4>checkin start: {{ new Date(qr_checkin.qr_checkin_start_time) }}</h4>
            <h4>checkin end: {{ new Date(qr_checkin.qr_checkin_end_time) }}</h4>
          </div>
          </div>
        </div>
        <h3 style="text-decoration:underline;">Live Polls</h3>
      </div>

      <div v-if="meeting.has_async_attendance">
        <h2 style="margin-top:5rem; text-decoration:underline;">Async Attendance</h2>
        <h3 style="text-decoration:underline;">Recordings</h3>
        <div  class="attendance-box" v-for="recording in meeting.async_attendance.recordings">
          <p style="font-weight:bold;" v-if="getWindowStatus(recording, false) === 'upcoming'">Upcoming</p>
          <p v-else-if="getWindowStatus(recording, false) === 'open'">Open</p>
          <p style="font-weight:bold;" v-else>Closed</p>
          <h4>recording submission start: {{ new Date(recording.recording_submission_start_time) }}</h4>
          <h4>recording submission end: {{ new Date(recording.recording_submission_end_time) }}</h4>
          <router-link :to="{name: 'watch_recording', params: { recording_id: recording._id }}">
            <button>Watch Recording</button>
          </router-link>
          <h4 style="text-decoration:underline;">Submissions</h4>
          <h4 v-for="submission in recording.recording_submissions">
            <p>
              {{ submission.submitter.first_name }} {{ submission.submitter.last_name }} ({{ submission.submitter.user_id }})
            </p>
          </h4>
        </div>
      </div>
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
        current_user: {},
        meeting_has_loaded: false,
        for_course: Boolean,
        checkin_window_open: false,
        current_qr_code: String,
        is_instructor: false,
        qr_scanning_window_open: false
      }
    },
    created() {
      this.current_user = this.$store.state.user.current_user
      this.is_instructor = this.current_user.is_instructor
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
      getWindowStatus(attendance, is_qr) {
        let current_time = new Date()
        let window_start = null
        let window_end = null
        if(is_qr) {
          window_start = new Date(attendance.qr_checkin_start_time)
          window_end = new Date(attendance.qr_checkin_end_time)
        } else {
          window_start = new Date(attendance.recording_submission_start_time)
          window_end = new Date(attendance.recording_submission_end_time)
        }
        let window_status = ""
        if(current_time > window_end)
          window_status = "closed"
        else if(current_time < window_start)
          window_status = "upcoming"
        else
          window_status = "open"
        return window_status
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
          if(this.getWindowStatus(meeting_checkins[i], true) === "open"){
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
      submissionExistsForUser(qr_checkin) {
        let submissions = qr_checkin.qr_checkin_submissions
        let user_submission_exists = false
        for(let i = 0; i < submissions.length; i++){
          if(submissions[i].user_id === this.current_user.usr_id){
            user_submission_exists = true
            break
          }
        }
        return user_submission_exists
      }
    }
  }
</script>

<style scoped>
.attendance-box {
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