<template>
  
  <div class='attend-checker'>
    <div class="lottie-container" v-if="attendance_success">
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

/*

AttendChecker:
This component should check the url params meeting_id (this.$route.meeting_id) and qr_key (this.$route.qr_key)
and run an API call to get the meeting and QR code with code == qr_key associated with the same meeting.

Once this has been found, if the user is logged in, automatically mark tham as submitting for the QR Submission
and redirect them to the meeting info page for the meeting in they just submitted for.

If not, prompt them to log in, and once they do so, attend them and redirect them to the meeting info page.

*/

import QRCheckinAPI from '@/services/QRCheckinAPI.js'
import VueLottiePlayer from 'vue-lottie-player'

export default {
  name: 'AttendChecker',
  created () {

    let current_user = this.$store.state.user
    if (!this.$store.state.user) {
      // redirect to login that should redirect back to this page.
      console.log(`User not logged in...`)
    }
    else {
      current_user = current_user.current_user

      // get the meeting_id, user_id and qr_code
      let meeting_id = this.$route.params.meeting_id
      let qr_code = this.$route.params.qr_key
      let user_id = current_user._id

      QRCheckinAPI.attendQR(user_id, meeting_id, qr_code)
      .then(res => {
        console.log(res)
        if (res.data.success) {
          console.log(`SUCCESS!!!`)
          this.attendance_success = true

          setTimeout(() => {
            // redirect to the meeting page
            this.$router.push({ name: 'meeting_info', params: { meeting_id: meeting_id } })

          }, 1700)
        }
        else {
          console.log(`PROBLEM OCCURRED...`)
        }
      })
      
    }
  },
  data () {
    return {
      attendance_success: false
    }
  },
  components: {
    vLottiePlayer: VueLottiePlayer
  },
  methods: {
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