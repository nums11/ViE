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

export default {
  name: 'AttendChecker',
  mixins: [helpers],
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
      if(this.getRealTimePortionStatus(
        this.meeting.real_time_portion) !== "open") {
        alert("Submission Failed: This meeting does not have any ongoing "
          + "real-time tasks.")
        this.redirectToDashboard()
        return
      }
      if(!this.userIsStudentForMeetingSection()) {
        alert("Submission Failed: You are not a student for this course.")
        this.redirectToDashboard()
        return
      }
      const open_qr_scan = this.getOpenQRScan(scanned_code)
      // if(this.isEmptyObj(open_checkin)){
      //   alert("Submission Failed: No Open QR Checkins.")
      //   this.redirectToDashboard()
      //   return
      // }
      // if(!this.scannedCodeIsValid(open_checkin, scanned_code)){
      //   alert("Submission Failed: Scanned invalid code!")
      //   this.redirectToDashboard()
      //   return
      // }
      if(this.studentSubmittedToQRScan(this.current_user.user_id,
        open_qr_scan)) {
        alert("Submission Failed: You have already submitted to this QR Checkin.")
        this.redirectToDashboard()
        return
      }
      console.log("Calling createSubmission")
      this.createSubmission(open_qr_scan)
    },
    userIsStudentForMeetingSection() {
      let meeting_students = []
      this.meeting.sections.forEach(section => {
        meeting_students = meeting_students.concat(section.students)
      })
      console.log("Students", meeting_students)
      let user_is_student = false
      for(let i = 0; i < meeting_students.length; i++) {
        if(meeting_students[i].user_id === this.current_user.user_id) {
          user_is_student = true
          break
        }
      }
      return user_is_student
    },
    getOpenQRScan(scanned_code) {
      let open_qr_scan = null
      const qr_scans = this.meeting.real_time_portion.qr_scans
      for(let i = 0; i < qr_scans.length; i++) {
        if(qr_scans[i].code === scanned_code) {
          open_qr_scan = qr_scans[i]
          break
        }
      }
      return open_qr_scan
    },
    getWindowStatus(task, is_qr) {
      let current_time = new Date()
      let window_start = null
      let window_end = null
      if(is_qr) {
        window_start = new Date(task.qr_scan_start_time)
        window_end = new Date(task.qr_scan_end_time)
      } else {
        window_start = new Date(task.video_submission_start_time)
        window_end = new Date(task.video_submission_end_time)
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
    async createSubmission(open_qr_scan) {
      try {
        const submission = {
          submitter: this.$store.state.user.current_user._id,
          task_type:"QRScan"
        }
        console.log("Adding submission")
        const response = await SubmissionAPI.addSubmission(submission,
          open_qr_scan._id)
        console.log("Added submission")
        this.show_qr_success_animation = true
        setTimeout(() => {
          this.show_qr_success_animation = false
          alert("Live Submisssion Recorded.")
          this.$router.push({name: 'meeting_info',
            params: {meeting_id: this.meeting_id}})
        }, 2000)
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong")
      }
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