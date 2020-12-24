<template>
  <div id="mobile-nav-slider">
    <!-- <img src="@/assets/logo.svg" id="logo" /> -->
    <sui-icon @click="$emit('hide-mobile-nav-slider')"
    name="x icon" size="big" inverted id="x-icon" />
    <div class="nav-link-container">
      <router-link class="nav-link" :to="{name: 'dashboard'}">
        Dashboard
      </router-link>
    </div>
    <div class="nav-link-container">
      <div class="nav-link">Courses</div>
      <div v-for="course in user_courses" :key="course._id"
      class="course-link-container">
        <div @click="routeToCourseInfo(course._id)" class="course-link">
          {{ course.name }}
        </div>
      </div>
    </div>
    <div class="nav-link-container">
      <router-link v-if="is_instructor" class="nav-link"
      :to="{name: 'register_course'}">
        Register Course
      </router-link>
      <router-link v-else class="nav-link"
      :to="{name: 'join_course'}">
        Join Course
      </router-link>
    </div>
    <div class="nav-link-container">
      <router-link class="nav-link" :to="{name: 'settings'}">
        Settings
      </router-link>
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
    is_instructor: {
      type: Boolean,
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
    routeToCourseInfo(id) {
      this.$router.push({name: 'course_info', params: {id: id}})
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
  position: absolute;
  width: 100%;
  height: 100%;
  /*margin-top: -3rem;*/
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