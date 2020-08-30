<template>
  
  <div class="course-org-invite">
    <div class="centerer">
      <div class="logo-area">
        <div class="logo-box" :style="{backgroundImage: `url( ${require('@/assets/venue-logo.svg')} )`}"></div>
        <div class="text-box">Venue</div>
      </div>
      <div class="text-body" v-if="loaded">
        <h3 class="header">Invite to {{ course == null ? org.name : course.name }}</h3>
        <p class="body-area">You have been invited to {{ course == null ? org.name : course.name }}. Click Accept Invite to be enrolled.</p>
      </div>
      <div class="button-area" v-if="loaded">
        <Button2 
          text="Accept Invite"
          :onClick="acceptInvite"
          :config="{
            width: '200px'
          }"
        />
      </div>
    </div>

    <div class="success-modal" v-if="show_success">
      <div class="centerer">

        <v-lottie-player 
          name="Check 2"
          :animationData="require('@/assets/lottie/check-2.json')"
          :loop="1"
          @animControl="animController"
          width="300px"
          height="300px"
          autoplay
        />

      </div>
    </div>
  </div>

</template>
<script>

import CourseAPI from '@/services/CourseAPI'
import OrgAPI from '@/services/OrgAPI'
import Button2 from '@/components/Button2'
import UserAPI from '@/services/UserAPI'
import VueLottiePlayer from 'vue-lottie-player'

export default {
  name: "CourseOrgAcceptInvite",
  data () {
    return {
      course: null,
      org: null,
      loaded: false,
      show_success: false
    }
  },
  components: {
    Button2,
    vLottiePlayer: VueLottiePlayer
  },
  created () {

    let user_id = this.$router.currentRoute.params.user_id
    let invite_key = this.$router.currentRoute.params.invite_key
    console.log(`User id: ${user_id}`)
    console.log(`Invite key: ${invite_key}`)
    if (this.$router.currentRoute.name == 'course_accept_invite') {
      // Course invite
      console.log(`Getting student information for course invite`)
      UserAPI.getCourseForUserInvite(user_id, invite_key)
      .then(res => {
        console.log(res)
        if (res.data.success) {
          this.course = res.data.data
          this.loaded = true
        }
      })
      .catch(err => {
        console.log(`Error retrieving course info`)
        console.log(err)
      })
    }
    else {
      // Org invite
      console.log(`Getting student information for course invite`)
      UserAPI.getOrgForUserInvite(user_id, invite_key)
      .then(res => {
        console.log(res)
        if (res.data.success){
          this.org = res.data.data
          this.loaded = true
        }
      })
      .catch(err => {
        console.log(`Error retrieving org info`)
        console.log(err)
      })
    }
  },
  methods: {
    acceptInvite () {
      let user_id = this.$router.currentRoute.params.user_id
      let invite_key = this.$router.currentRoute.params.invite_key
      if (this.course != null) {
        CourseAPI.acceptInvite(user_id, invite_key)
        .then(res => {
          console.log(`Invite accept response`)
          console.log(res)
          this.show_success = true

          setTimeout(() => {
            this.$router.push({name: 'dashboard'})
          }, 1000)
        })
        .catch(err => {
          console.log(err)
        })
      }
      else if (this.org != null) {
        OrgAPI.acceptInvite(user_id, invite_key)
        .then(res => {
          console.log(`Invite accept response`)
          console.log(res)
          this.show_success = true

          setTimeout(() => {
            this.$router.push({name: 'dashboard'})
          }, 1000)
        })
        .catch(err => {
          console.log(err)
        })
      }
    }
  }
}
</script>
<style lang="scss">

.course-org-invite {
  background-color: white;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  .success-modal {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: white;

    .centerer {
      width: 300px;
      height: 300px;
      margin: 0 auto;
      position: relative;
      top: 35%;
    }
  }
  
  .centerer {
    min-width: 350px;
    max-width: 500px;
    margin: 0 auto;
    position: relative;
    top: 25%;

    .button-area {
      text-align: center;
      margin-top: 40px;
    }

    .text-body {
      .header {
        font-family: Lato;
        font-size: 1.3rem;
        color: #383B3F;
      }
    }

    .logo-area {
      margin-bottom: 20px;
      height: 50px;
      display: flex;
      align-items: center;

      .logo-box {
        width: 35px;
        height: 35px;
        background-size: 100%;
        background-repeat: no-repeat;
        margin-right: 10px;
      }

      .text-box {
        font-family: Ubuntu;
        font-size: 2rem;
        color: #383B3F;
      }
    }
  }
}
</style>