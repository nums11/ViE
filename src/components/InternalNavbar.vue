<template>
  <div>
    <sui-loader v-if="!user_has_loaded" active />
    <div v-else>
      <hide-at breakpoint="mediumAndBelow">
        <InternalDesktopNavbar :user="user"
        :user_courses="user_courses" 
        :is_instructor="is_instructor"
         />
      </hide-at>
      <show-at breakpoint="mediumAndBelow">
        <InternalMobileNavbar :user="user"
        :user_courses="user_courses" 
        :is_instructor="is_instructor"
        v-on:show-mobile-nav-slider="$emit('show-mobile-nav-slider',user,user_courses)" />
      </show-at>
    </div>
  </div>
</template>

<script>
import {showAt, hideAt} from 'vue-breakpoints'
import UserAPI from '@/services/UserAPI.js';
import AuthAPI from '@/services/AuthAPI.js';
import InternalDesktopNavbar from '@/components/InternalDesktopNavbar';
import InternalMobileNavbar from '@/components/InternalMobileNavbar';

export default {
  name: 'InternalNavBar',
  computed: {
  },
  components: {
    hideAt,
    showAt,
    InternalDesktopNavbar,
    InternalMobileNavbar
  },
  data(){
    return {
      user: {},
      user_courses: [],
      is_instructor: false,
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

</style>