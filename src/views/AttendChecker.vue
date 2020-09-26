<template>
  <div class='attend-checker'>
    <div class="lottie-container" v-if="show_qr_success_anmiation">
      <v-lottie-player 
        name="QR CODE"
        :animationData="require('@/assets/lottie/qr-code-scan.json')"
        :loop="1"
        @animControl="animController"
        width="450px"
        height="450px"
        autoplay
      />
    </div>
  </div>
</template>

<script>
import QRCheckinAPI from '@/services/QRCheckinAPI.js'
import VueLottiePlayer from 'vue-lottie-player'
import MeetingAPI from '@/services/MeetingAPI.js';

export default {
  name: 'AttendChecker',
  async created () {
    this.checkIfUserIsLoggedIn()
    if(this.current_user == null) {
      console.log("Redirect user to login")
      // this.$router.push({
      //   name: 'login',
      //   query: {
      //     redirect: {
      //       name: 'attend_checker',
      //       params: {
      //         meeting_id: this.$route.params.meeting_id,
      //         qr_key: this.$route.params.qr_key
      //       }
      //     }
      //   }
      // })
    } else {
      console.log("User was logged in")
      await this.getMeeting()
      this.attemptQRCheckinSubmission(this.$route.params.code)
    }
  },
  data () {
    return {
      show_qr_success_anmiation: false
    }
  },
  components: {
    vLottiePlayer: VueLottiePlayer
  },
  methods: {
    checkIfUserIsLoggedIn() {
      if(this.$store.state.user){
        this.current_user = this.$store.state.user.current_user
        return true
      } else {
        return false
      }
    },
    async getMeeting() {
      console.log("Getting meeting")
      this.meeting_id = this.$route.params.meeting_id
      const response = await MeetingAPI.getMeeting(this.meeting_id)
      this.meeting = response.data
    },
    attemptQRCheckinSubmission(scanned_code) {
      console.log("Trying to submit")
      let open_checkin = this.getOpenQRCheckin()
      if(this.isEmptyObj(open_checkin)){
        alert("No Open QR Checkins")
        this.redirectToDashboard()
      }else if(this.scannedCodeIsValid(open_checkin, scanned_code))
        this.createLiveSubmission(open_checkin)
      else {
        alert("Scanned invalid code!")
        this.redirectToDashboard()
      }
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
    scannedCodeIsValid(open_checkin, scanned_code) {
      return `https://byakugan.herokuapp.com/#/attend/${this.$route.params.meeting_id}/${open_checkin.code}` === scanned_code
    },
    redirectToDashboard() {
      this.$router.push({name: 'dashboard'})
    },
    isEmptyObj(obj) {
      return Object.keys(obj).length === 0 && obj.constructor === Object
    },
    async createLiveSubmission(open_checkin) {
      let live_submission = {
        submitter: this.$store.state.user.current_user._id,
        is_qr_checkin_submission: true,
        qr_checkin: open_checkin._id,
        live_submission_time: new Date()
      }
      const response = await LiveSubmissionAPI.addLiveSubmission(live_submission)
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
.attend-checker {
  position: fixed;
  z-index: 2000000000;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  .lottie-container {
    width: 450px;
    height: 450px;
    margin: 0 auto;
    position: relative;
    top: 50%;
    transform: translateY(-50%);
  }
}

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