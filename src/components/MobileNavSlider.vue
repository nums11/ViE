<template>
  <div id="mobile-nav-slider">
    <!-- <img src="@/assets/logo.svg" id="logo" /> -->
    <sui-icon @click="$emit('hide-mobile-nav-slider')"
    name="x icon" size="big" inverted id="x-icon" />
    <div class="nav-link-container">
      <div @click="changeRoute('dashboard')" class="nav-link">
        Dashboard
      </div>
    </div>
    <div class="nav-link-container">
      <div class="nav-link">Courses</div>
      <div v-for="course in user_courses" :key="course._id"
      class="course-link-container">
        <div @click="changeRoute('course_info', {id: course._id})" class="course-link">
          {{ course.name }}
        </div>
      </div>
    </div>
    <div class="nav-link-container">
      <div v-if="is_instructor" @click="changeRoute('register_course')"
      class="nav-link">
        Register Course
      </div>
      <div v-else @click="changeRoute('join_course')"
      class="nav-link">
        Join Course
      </div>
    </div>
    <div class="nav-link-container">
      <div class="nav-link" @click="changeRoute('register_course')">
        Settings
      </div>
    </div>
    <div id="user-name">
      {{ user.first_name }} {{ user.last_name }} ({{ user.user_id }})
    </div>
    <div id="label-container">
      <sui-label id="label">{{ is_instructor ? 'Instructor' : 'Student'}}</sui-label>
    </div>
    <div @click="logOut" id="logout-btn">Log out</div>
  </div>
</template>

<script>
import AuthAPI from '@/services/AuthAPI'

export default {
  name: 'MobileNavSlider',
  props: {
    user: {
      type: Object,
      required: true
    },
    user_courses: {
      type: Array,
      required: true
    }
  },
  computed: {
  },
  components: {

  },
  data(){
    return {
    }
  },
  created() {
  },
  methods: {
    changeRoute(route_name, params) {
      this.$router.push({name: route_name, params: params})
      this.$emit('hide-mobile-nav-slider')
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
#mobile-nav-slider {
  position: fixed;
  width: 100%;
  height: 100%;
  background-color: #e83e8c;
  padding-top: 1rem;
  padding-left: 2rem;
  padding-right: 2rem;
  z-index: 10;
}

#x-icon {
  float: right;
}

.nav-link-container {
  margin-top: 5rem;
}

.nav-link {
  font-size: 3rem;
  color: white;
  font-weight: bold;
}

.course-link-container:first-child {
  margin-top: 2rem;
}


.course-link-container {
  margin-top: 2rem;
  padding-left: 1rem;
}


.course-link {
  font-size: 1.5rem;
  color: white;
  font-weight: bold;
}

#user-name {
  text-align: center;
  color: white;
  margin-top: 4rem;
  font-size: 1.25rem;
}

#label-container {
  margin-top: 1rem;
  text-align: center;
}

#label {
  background-color: #00B3FF;
  color: white;
}

#logout-btn {
  text-align: center;
  margin-top: 2rem;
  font-size: 2rem;
  color: white;
  font-weight: bold;
}

/* Very small phones */
@media (max-width: 360px) {
  .nav-link-container {
    margin-top: 4rem;
  }
  .nav-link {
    font-size: 2rem;
  }
}

/* Tablet */
@media (min-width: 768px) {
  #mobile-nav-slider {
    padding-top: 2rem;
    padding-left: 3rem;
    padding-right: 3rem;
  }
}
</style>