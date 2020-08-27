<template>
  <div id="app" :class="dark_mode ? 'dark-mode' : 'light-mode'">
    <portal-target name="semantic-ui-vue" />
    <NavBar 
      :setDarkModeValue="setDarkModeValue"
      :initialDarkModeValue="dark_mode"
      class="main_navbar" 
      v-if="!isNavbarlessView() && this.$route.name != 'set_permanent_password' && current_user"
    />
    <div class="venue-body">
      <transition
          name="fade"
          mode="out-in"
        >
        <router-view :key="$route.fullPath" />
      </transition>
    </div>
  </div>
</template>

<script>

import NavBar from "./components/NavBar.vue";
import Footer from "./components/Footer.vue";
import LectureAPI from './services/LectureAPI';
import {getLiveLectures,getUpcomingLectures,getPastLectures} from './services/GlobalFunctions.js'
import '@/assets/css/venue.css';
import axios from 'axios';
import io from 'socket.io';
import Cookie from 'cookie';

export default {
  watch: {
    '$route' (to, from) {
      document.title = to.meta.title || 'Venue'
    }
  },
  components: {
    NavBar,
    Footer
  },
  data() {
    return {
      current_user: null,
      dark_mode: Boolean
    }
  },
  created() {
    console.log("env", process.env)
    axios.defaults.headers.common['Access-Control-Allow-Methods'] = ["GET, POST, DELETE"]

    // window.onbeforeunload = () => {
    //     io.emit('leave', this.username);
    // }

    // io.on('connection', (socket) => {
    //   console.log('made socket connection');
    //   socket.on('chat', function(data){
    //     // io.sockets.emit('chat',data);
    //     console.log(data);
    //   });
    // });

    
    // io.on('connections', (data) => {
    //     this.connections = data;
    // });

    let self = this
    var waitForUser = setInterval(function(){
      if (self.$store.state.user && self.$store.state.user.current_user) {
        self.current_user = self.$store.state.user.current_user
        // self.afterUser()
        clearInterval(waitForUser);
      }
    }, 100);

    // load user preferences from cookies
    var cookies_ = document.cookie.split(";");
    for (var i = 0; i < cookies_.length; ++i) {
      var cookie_ = Cookie.parse(cookies_[i]);
      console.log(cookie_);
      if (Object.prototype.hasOwnProperty.call(cookie_, "darkMode")) {
        this.dark_mode = cookie_.darkMode == "true";
      }
    }
  },
  methods: {
    isNavbarlessView () {
      let exclude = ['landing_page', 'login', 'attend_checker', 'course_new_meeting', 'org_new_meeting']
      return exclude.includes(this.$route.name)
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
    },
    afterUser() {
      if(this.current_user.is_instructor) {
        LectureAPI.getLecturesForUser(this.current_user._id, "none") 
          .then(res => {
            let liveAndUpcoming = getLiveLectures(res.data).concat(getUpcomingLectures(res.data))
            if (!("Notification" in window)) {
              alert("This browser does not support desktop notification");
            } else if (Notification.permission === "granted") {
              this.processNotifications(liveAndUpcoming)
            } else if (Notification.permission !== "denied") {
              Notification.requestPermission().then(function (permission) {
                if (permission === "granted") {
                  this.processNotifications(liveAndUpcoming)
                }
              });
            }
            this.processInstructorEmails(getPastLectures(res.data))
          })
      } else {
        
      }
    },
    processNotifications(lectures) {
      for(let i=0;i<lectures.length;i++) {
        for(let j=0;j<lectures[i].checkins.length;j++) {
          let timeuntil = Date.parse(lectures[i].checkins[j].start_time) - Date.now()
          if(timeuntil > -1000) { //If the page loads within one second of checkin-time
            let self = this
            setTimeout(function() {
              self.attendanceNotification(lectures[i]._id)
            },timeuntil)
          }
        }
      }
    },
    attendanceNotification(lectureid) {
      var notification = new Notification("Time to take attendance!");
      notification.onclick = function(event) {
        event.preventDefault(); // prevent the browser from focusing the Notification's tab
        if(process.env.NODE_ENV === "production") {
          window.open('https://venue-attend.herokuapp.com/#/lecture_info/'+lectureid, '_blank');
        } else {
          window.open('http://localhost:8080/#/lecture_info/'+lectureid, '_blank');
        }
      }
    },
    processInstructorEmails(lectures) {
      LectureAPI.processEmailsForLectures(lectures,this.current_user.email)
    }
  }
  //initially displayNav is false because the first page loaded is the homepage
}
</script>

<style lang="scss">
#app {
  padding-left: 20px;
  padding-right: 20px;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  // min-height: 100%;
  /*border-right: 1px solid #00FFFF;
  border-left: 1px solid #00FFFF;*/
}
/*
.venue-body {
  margin-left: 70px;
}
*/
/*
@media only screen and (max-width: 900px) {
  .venue-body {
    margin-left: 0px;
  }
}
*/
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

.inline-block {
  display: inline-block;
}

.float-right {
  float: right;
}

</style>
