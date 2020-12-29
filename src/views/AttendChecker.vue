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

export default {
  name: 'AttendChecker',
  async created () {
    if(!this.userIsLoggedIn()) {
      if(process.env.NODE_ENV === "production") {
        this.cas_url = "https://cas-auth.rpi.edu/cas/login?service=https%3A%2F%2Fvenue-attend.herokuapp.com%2Fauth%2FloginCAS-"
          + `${this.$route.params.meeting_id}-${this.$route.params.code}`
      } else {
        this.cas_url = "https://cas-auth.rpi.edu/cas/login?service=http%3A%2F%2Flocalhost%3A4000%2Fauth%2FloginCAS-" + `${this.$route.params.meeting_id}-${this.$route.params.code}`
      }
      window.location.href = this.cas_url;
    } else {
      await this.getMeeting()
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
      this.meeting_id = this.$route.params.meeting_id
      const response = await MeetingAPI.getMeeting(this.meeting_id)
      this.meeting = response.data
    },
    attemptQRScanSubmission(scanned_code) {
      if(!this.currentUserIsStudentForCourse()) {
        alert("Submission Failed: You are not a student for this course.")
        this.redirectToDashboard()
        return
      }
      let open_checkin = this.getOpenQRScan()
      if(this.isEmptyObj(open_checkin)){
        alert("Submission Failed: No Open QR Checkins.")
        this.redirectToDashboard()
        return
      }
      if(this.studentSubmittedToQRScan(open_checkin)) {
        alert("Submission Failed: You have already submitted to this QR Checkin.")
        this.redirectToDashboard()
        return
      }
      if(!this.scannedCodeIsValid(open_checkin, scanned_code)){
        alert("Submission Failed: Scanned invalid code!")
        this.redirectToDashboard()
        return
      }
      this.createSubmission(open_checkin)
    },
    currentUserIsStudentForCourse() {
      let meeting_students = this.meeting.course.students
      let user_is_student = false
      for(let i = 0; i < meeting_students.length; i++) {
        if(meeting_students[i].user_id === this.current_user.user_id) {
          user_is_student = true
          break
        }
      }
      return user_is_student
    },
    studentSubmittedToQRScan(qr_scan) {
      let submissions = qr_scan.submissions
      let student_has_submitted = false
      for(let i = 0; i < submissions.length; i++) {
        if(submissions[i].submitter.user_id === this.current_user.user_id){
          student_has_submitted = true
          break
        }
      }
      return student_has_submitted
    },
    getOpenQRScan() {
      let open_checkin = {}
      let meeting_checkins = this.meeting.real_time_portion.qr_scans
      for(let i = 0; i < meeting_checkins.length; i++) {
        if(this.getWindowStatus(meeting_checkins[i], true) === "open"){
          open_checkin = meeting_checkins[i]
          break
        }
      }
      return open_checkin
    },
    getWindowStatus(task, is_qr) {
      let current_time = new Date()
      let window_start = null
      let window_end = null
      if(is_qr) {
        window_start = new Date(task.qr_scan_start_time)
        window_end = new Date(task.qr_scan_end_time)
      } else {
        window_start = new Date(task.recording_submission_start_time)
        window_end = new Date(task.recording_submission_end_time)
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
    scannedCodeIsValid(open_checkin, scanned_code) {
      return open_checkin.code === scanned_code
    },
    redirectToDashboard() {
      this.$router.push({name: 'dashboard'})
    },
    isEmptyObj(obj) {
      return Object.keys(obj).length === 0 && obj.constructor === Object
    },
    async createSubmission(open_checkin) {
      let submission = {
        submitter: this.$store.state.user.current_user._id,
        is_qr_scan_submission: true,
        qr_scan: open_checkin._id,
        submission_time: new Date()
      }
      const response = await SubmissionAPI.addSubmission(submission)
      this.show_qr_success_animation = true
      setTimeout(() => {
        this.show_qr_success_animation = false
        alert("Live Submisssion Recorded.")
        this.$router.push({name: 'meeting_info', params: {meeting_id: this.meeting_id}})
      }, 2000)
    },
    animController (g, a) {
      console.log(`CONTROLLER CALLED`)
      console.log(g)
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