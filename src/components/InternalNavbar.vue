<template>
  <div id="internal-navbar">
    <div id="logo-container">
      <router-link :to="{name: 'dashboard'}">
        <img src="@/assets/logo.svg" id="logo" />
        <div id="app-name">ViE</div>
      </router-link>
    </div>
    <div id="nav-buttons-container">
      <router-link :class="'nav-link ' + (this.$route.name === 'dashboard' ?
      'active-link' : '')" :to="{name: 'dashboard'}">
        Dashboard
      </router-link>
      <p :class="'nav-link ' + (this.$route.name === 'course_info' ?
      'active-link' : '')" id="courses-link">
        <sui-dropdown style="" text="Courses" floating :loading="!user_has_loaded">
          <sui-dropdown-menu v-if="user_courses.length > 0 "
            id="dropdown-menu-container">
            <sui-dropdown-item v-for="course in user_courses"
            @click="changeRoute('course_info', {id: course._id})" :key="course._id">
              {{ course.name }}
            </sui-dropdown-item>
          </sui-dropdown-menu>
          <sui-dropdown-menu v-else id="dropdown-menu-container">
            <sui-dropdown-item>
              No Courses
            </sui-dropdown-item>
          </sui-dropdown-menu>
        </sui-dropdown>
      </p>
    </div>
    <div id="right-side">
      <sui-popup content="Get help" position="bottom center" inverted>
        <sui-icon name="question circle outline" size="large" id="question"
        slot="trigger"/>
      </sui-popup>
      <sui-dropdown button
      :loading="!user_has_loaded"
      :text="`${user.first_name} ${user.last_name}`"
      id="user-name" floating icon="null">
        <sui-dropdown-menu>
          <sui-dropdown-item @click="changeRoute(is_instructor ? 
          'register_course' : 'join_course')">
            {{ is_instructor ? 'Register course' : 'Join Course' }}
          </sui-dropdown-item>
          <sui-dropdown-item @click="changeRoute('settings')">
            Settings
          </sui-dropdown-item>
          <sui-dropdown-item @click="logOut">Log out</sui-dropdown-item>
        </sui-dropdown-menu>
      </sui-dropdown>
    </div>
  </div>
</template>

<script>
import {showAt, hideAt} from 'vue-breakpoints'
import UserAPI from '@/services/UserAPI.js';
import AuthAPI from '@/services/AuthAPI.js';

export default {
  name: 'InternalNavBar',
  computed: {
  },
  components: {
    hideAt,
    showAt
  },
  data(){
    return {
      user: {},
      user_courses: [],
      is_instructor: Boolean,
      user_has_loaded: false
    }
  },
  created() {
    this.waitForLoginToCompleteThenGetUser()
  },
  methods: {
    // On first login the state may not have the user
    // so we must wait until it is available
    async waitForLoginToCompleteThenGetUser() {
      if(this.$store.state.user == null){
        setTimeout(this.waitForLoginToCompleteThenGetUser, 250)
      } else {
        await this.getUser()
        this.assignUserCourses()
        this.user_has_loaded = true
      }
    },
    async getUser() {
      const user_object_id = this.$store.state.user.current_user._id
      try {
        const response = await UserAPI.getUser(user_object_id)
        this.user = response.data
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong getting your info")
      }
    },
    assignUserCourses() {
      if(this.user.is_instructor)
        this.user_courses = this.user.instructor_courses
      else {
        this.user.student_sections.forEach(section => {
          this.user_courses.push(section.course)
        })
      }
    },
    // Todo: come back and fix error when navigating to the same route
    changeRoute(route_name, params) {
      this.$router.push({name: route_name, params: params})
    },
    async logOut() {
      try {
        await AuthAPI.logoutCAS()
        this.$store.dispatch('logout')
      } catch(error) {
        console.log(error)
        alert("Sorry something went wrong when trying to log out")
      }
    },
  }
}
</script>

<style scoped>
#internal-navbar {
  padding-left: 3rem;
  padding-right: 3rem;
  padding-top: 1rem;
  margin-bottom: 3rem;
}

#logo-container {
  display: inline-block;
  vertical-align: top;
  cursor: pointer;
}

#logo {
  height: 2.75rem;
  display: inline-block;
  vertical-align: top;
}

#app-name {
  display: inline-block;
  vertical-align: top;
  margin-left: 0.5rem;
  font-size: 2.25rem;
  color: #2c3e50;
  font-weight: 500;
  height: 3rem;
  padding-top: 1rem;
}

#nav-buttons-container {
  display: inline-block;
  vertical-align: top;
  height: 3rem;
  width: 33%;
  /*margin-left: 37.5%;*/
  /*padding-top: 1rem;*/
}

.nav-link {
  display: inline-block;
  font-size: 1.25rem;
  cursor: pointer;
  color: black;
  margin-left: 3rem;
  vertical-align: bottom;
/*  color: black;*/
  color: #2c3e50;
  /*font-weight: bold;*/
  /*font-weight: bold;*/
  /*border: black solid;*/
  padding-top: 1rem;
  height: 3rem;
  width: 30%;
  text-align: center;
}

#courses-link {
  padding-top: 0.8rem;
}

.active-link {
  border-bottom: black solid;
  font-weight: bold;
}

#dropdown-menu-container {
  margin-left: -1.5rem;
  min-width: 9rem;
}

#right-side {
  float: right;
}

#question {
  /*vertical-align: bottom;*/
  cursor: pointer;
}

#user-name {
  margin-top: 0.5rem;
  background-color: #e83e8c;
  color: white;
  margin-left: 1rem;
  padding-right: 0;
}
</style>