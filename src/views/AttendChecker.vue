<template>
  <div class='attend-checker'>
    <QRSuccessAnimation v-if="show_qr_success_animation" />
  </div>
</template>

<script>
import QRScanAPI from '@/services/QRScanAPI.js'
import MeetingAPI from '@/services/MeetingAPI.js';
import SubmissionAPI from '@/services/SubmissionAPI.js';
import QRSuccessAnimation from '@/components/animations/QRSuccessAnimation.vue'
import helpers from '@/helpers.js'
import io from 'socket.io-client';

export default {
  name: 'AttendChecker',
  mixins: [helpers],
  async created () {
    if(!this.userIsLoggedIn()) {
      // Redirect RPI students to CAS Login
      if(this.$route.params.is_rpi === "true") {
        if(process.env.NODE_ENV === "production") {
          this.cas_url = "https://cas-auth.rpi.edu/cas/login?service=https%3A%2F%2Fviengage.com%2Fauth%2FloginCAS-"
            + `${this.$route.params.meeting_id}-${this.$route.params.qr_scan_id}-${this.$route.params.code}-false`
        } else {
          this.cas_url = "https://cas-auth.rpi.edu/cas/login?service=http%3A%2F%2Flocalhost%3A4000%2Fauth%2FloginCAS-" + `${this.$route.params.meeting_id}-${this.$route.params.qr_scan_id}-${this.$route.params.code}-false`
        }
        window.location.href = this.cas_url;
      } else {
        this.$router.push({name: 'login',
          params: {
            submit_to_qr: true,
            meeting_id: this.$route.params.meeting_id,
            qr_scan_id: this.$route.params.qr_scan_id,
            code: this.$route.params.code
          }
        })
      }
    } else {
      await this.getMeeting()
      if(this.meeting == null)
        return
      this.getQRScan()
      if(this.qr_scan == null)
        return
      this.attemptQRScanSubmission(this.$route.params.code)
    }
  },
  data () {
    return {
      show_qr_success_animation: false
    }
  },
  components: {
    QRSuccessAnimation
  },
  methods: {
    userIsLoggedIn() {
      if(this.$store.state.user){
        this.current_user = this.$store.state.user.current_user
        return true
      } else {
        return false
      }
    },
    async getMeeting() {
      try {
        this.meeting_id = this.$route.params.meeting_id
        this.qr_scan_id = this.$route.params.qr_scan_id
        this.scanned_code = this.$route.params.code
        const response = await MeetingAPI.getMeeting(this.meeting_id)
        this.meeting = response.data
      } catch(error) {
        console.log(error)
        this.showInvalidURLAlert()
        this.redirectToDashboard()
      }
    },
    getQRScan() {
      const meeting_qr_scans = this.meeting.real_time_portion.qr_scans
      for(let i = 0; i < meeting_qr_scans.length; i++) {
        const qr_scan = meeting_qr_scans[i]
        if(qr_scan._id === this.qr_scan_id){
          this.qr_scan = qr_scan
          break
        }
      }
      if(this.qr_scan == null) {
        this.showInvalidURLAlert()
        this.redirectToDashboard()
      }
    },
    showInvalidURLAlert() {
      window.alert("Something went wrong. Please make sure you "
        + " scanned the correct code")
    },
    attemptQRScanSubmission(scanned_code) {
      if(this.getRealTimePortionStatus(
        this.meeting.real_time_portion) !== "open") {
        window.alert("Submission Failed: The real-time portion of the meeting is "
          + "not open. Your instructor may need to adjust the meeting times.")
        this.redirectToDashboard()
        return
      }
      if(!this.userIsStudentForMeetingSection()) {
        window.alert("Submission Failed: You are not a student for this course.")
        this.redirectToDashboard()
        return
      }
      if(this.studentSubmittedToQRScan(this.current_user.user_id,
        this.qr_scan)) {
        window.alert("Submission Failed: You have already submitted to this QR SCan.")
        this.redirectToDashboard()
        return
      }
      if(!this.scannedCodeIsValid()){
        window.alert("Submission Failed: Scanned invalid code!")
        this.redirectToDashboard()
        return
      }
      this.emitSubmissionEvent()
    },
    userIsStudentForMeetingSection() {
      const meeting_student_ids = this.getMeetingStudentIDs(this.meeting)
      return meeting_student_ids.has(this.current_user.user_id)
    },
    scannedCodeIsValid() {
      return this.qr_scan.code === this.scanned_code
    },
    redirectToDashboard() {
      this.$router.push({name: 'dashboard'})
    },
    emitSubmissionEvent() {
      this.show_qr_success_animation = true
      const url = this.getBaseURL()
      const client_io = io(url, {forceNew: true})
      client_io.emit('attemptQRScanSubmission', this.qr_scan._id,
        this.current_user.first_name, this.current_user.last_name,
        this.current_user.user_id, this.current_user._id,
        (instructor_showing_qr, submission_created) => {
          if(instructor_showing_qr) {
            if(submission_created)
              window.alert("Submisssion Recorded.")
            else
              window.alert("Sorry, something went wrong creating your submission")
          } else {
            window.alert("Submission Failed: Instructor must be showing the QR")
          }
          this.show_qr_success_animation = false
          this.$router.push({name: 'meeting_info',
            params: {meeting_id: this.meeting_id}})
        }
      )
    }
  }
}
</script>

<style lang="scss">
.dark-mode {
  .attend-checker {
    background-color: #121419;
  }
}

.light-mode {
  .attend-checker {
    background-color: white;
  }
}
</style>