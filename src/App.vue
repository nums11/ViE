<template>
  <div id="app" :class="dark_mode ? 'dark-mode' : 'light-mode'">
    <portal-target name="semantic-ui-vue" />
    <transition name="slide">
      <MobileNavSlider v-if="show_mobile_nav_slider"
      :user="navbar_user" :user_courses="navbar_user_courses"
      v-on:hide-mobile-nav-slider="hideMobileNavSlider" />
    </transition>
    <InternalNavbar v-if="isInternalRoute && !isNavbarlessView"
    v-on:show-mobile-nav-slider="showMobileNavSlider" />
    <div>
      <transition name="fade" mode="out-in">
        <router-view :key="$route.fullPath" />
      </transition>
    </div>
    <!-- <ExternalFooter /> -->
    <!-- <NewVersionMessage v-if="new_app_version_exists" /> -->
  </div>
</template>

<script>

import InternalNavbar from "./components/InternalNavbar.vue";
import Footer from "./components/Footer.vue";
import axios from 'axios';
import io from 'socket.io-client';
import Cookie from 'cookie';
import NewVersionMessage from '@/components/NewVersionMessage'
import UserAPI from '@/services/UserAPI';
import ExternalFooter from '@/components/ExternalFooter'
import MobileNavSlider from '@/components/MobileNavSlider'
import helpers from '@/helpers.js'

export default {
  mixins: [helpers],
  watch: {
    '$route' (to, from) {
      document.title = to.meta.title || 'ViE'
      if(this.new_app_version_exists)
        this.$router.go()
    }
  },
  components: {
    InternalNavbar,
    Footer,
    NewVersionMessage,
    ExternalFooter,
    MobileNavSlider
  },
  data() {
    return {
      current_user: null,
      dark_mode: false,
      new_app_version_exists: false,
      show_mobile_nav_slider: false,
      external_route_names: [
        'landing_page',
        'login',
        'signup',
        'create_user',
        'what-is-vie',
        'testimonials',
        'reset_password'
      ],
      navbarless_view_names: [
        'landing_page',
        'login',
        'attend_checker',
        'course_new_meeting',
        'org_new_meeting',
        'add_video'
      ],
      navbar_user: null,
      navbar_user_courses: null,
    }
  },
  computed: {
    isInternalRoute() {
      return !this.external_route_names.includes(this.$route.name)
    },
    isNavbarlessView () {
      return this.navbarless_view_names.includes(this.$route.name)
    },
  },
  created() {
    axios.defaults.headers.common['Access-Control-Allow-Methods'] = ["GET, POST, DELETE"]

    if(this.$store.state.user) {
      this.is_logged_in = true
      this.current_user = this.$store.state.user.current_user
      this.$store.dispatch('fixTokenIfNeeded')
      this.checkNotificationPermissions()
    }

    let url = ""
    if(process.env.NODE_ENV === "production") {
      url = "https://viengage.com/"
    } else {
      url = "http://localhost:4000/"
    }
    let client_io = io (url, {forceNew: true})
    client_io.on('server-update', () => {
      console.log("New App version exists")
      this.new_app_version_exists = true
    })

    let self = this
    var waitForUser = setInterval(function(){
      if (self.$store.state.user && self.$store.state.user.current_user) {
        self.current_user = self.$store.state.user.current_user
        // self.afterUser()
        clearInterval(waitForUser);
      }
    }, 100);
  },
  methods: {
    async checkNotificationPermissions() {
      if ("Notification" in window) {
        if(Notification.permission === "default") {
          let permission = await Notification.requestPermission()
          if (permission === "granted") {
            this.registerServiceWorkerAndAddSubscription()
          }
        } else if(Notification.permission === "granted") {
            this.registerServiceWorkerAndAddSubscription()
        }
      }
    },
    showMobileNavSlider(user, user_courses) {
      this.navbar_user = user
      this.navbar_user_courses = user_courses
      this.show_mobile_nav_slider = true
    },
    hideMobileNavSlider() {
      this.show_mobile_nav_slider = false
    },
    setDarkModeValue (new_value) {
      this.dark_mode = new_value;
      // update the cookie preferences also.\
      document.cookie = Cookie.serialize("darkMode", this.dark_mode, {
        maxAge: 60 * 60 * 24 * 7 * 4 // 1 month
      })
      // update the body background-color through javascript because it is too far up
      // the heirarchy for us to update through Vue.
      let body = document.getElementsByTagName("body")[0]
      body.style.backgroundColor = this.dark_mode ? "#121419" : "white"
    }
  }
}
</script>

<style lang="css">
@font-face {
  font-family: Exo;
  src: url(assets/fonts/Exo/Exo-Regular.ttf);
}

@font-face {
  font-family: Exo;
  src: url(assets/fonts/Exo/Exo-Bold.ttf);
  font-weight: bold;
}

@font-face {
  font-family: Exo;
  src: url(assets/fonts/Exo/Exo-Light.ttf);
  font-weight: lighter;
}

#app {
  font-family: Exo, "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html, body {
  margin: 0;
  padding: 0;
}

.blue-text {
  color: #00B3FF;
}

.pink-text {
  color: #e83e8c;
}

.bold {
  font-weight: bold;
}

.float-left {
  float: left;
}

.float-right {
  float: right;
}

.wrap-text {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.form-header {
  margin-top: 3rem;
  font-size: 3rem;
}

.form {
  width: 70%;
  margin: auto;
  margin-top: 3rem;
}

.form-field:not(:first-child) {
  margin-top: 3rem;
}

.form-label {
  padding-left: 0.5rem;
  text-align: left;
}

.light-border-shadow {
  border: #c7c7c7 solid thin;
  box-shadow: 0px 1px 1px #c7c7c7;
}

.inline-block {
  display: inline-block;
  vertical-align: top;
}

.center-text {
  text-align: center;
}

.right-text {
  text-align: right;
}

.auto {
  margin: auto;
}

.mt-1 {
  margin-top: 1rem;
}

.mt-2 {
  margin-top: 2rem;
}

.mt-3 {
  margin-top: 3rem;
}

.ml-1 {
  margin-left: 1rem;
}

.ml-2 {
  margin-left: 2rem
}

.ml-3 {
  margin-left: 3rem;
}

.mr-1 {
  margin-right: 1rem;
}

.mr-2 {
  margin-right: 2rem;
}

.mr-3 {
  margin-right: 3rem;
}

.mb-1 {
  margin-bottom: 1rem;
}

.mb-2 {
  margin-bottom: 2rem;
}

.mb-3 {
  margin-bottom: 3rem;
}

.none {
  display: none;
}

.error {
  color: #FF0000;
}

/*Fixes loader styling in modals*/
.ui.dimmer .ui.workaround.loader:before {
  border-color: rgba(0,0,0,.1);
  color: black;
}
          
.ui.dimmer .ui.workaround.loader:after {
  border-color: #767676 transparent transparent;
  color: black;
}

.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.3s;
  transition-property: opacity;
  transition-timing-function: ease;
}
.fade-enter,
.fade-leave-active {
  opacity: 0;
}

.slide-leave-active,
.slide-enter-active {
  transition: 0.5s;
}
.slide-enter {
  transform: translate(100%, 0);
}
.slide-leave-to {
  transform: translate(100%, 0);
}

@font-face {
  font-family: Oxygen;
  src: url(assets/fonts/Oxygen/Oxygen-Regular.ttf);
}

@font-face {
  font-family: Oxygen;
  src: url(assets/fonts/Oxygen/Oxygen-Bold.ttf);
  font-weight: bold;
}

@font-face {
  font-family: Oxygen;
  src: url(assets/fonts/Oxygen/Oxygen-Light.ttf);
  font-weight: lighter;
}

</style>
