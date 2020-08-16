<template>

  <div>
    <div class="venue-navbar">
        <div class="left-area">
            <div class="logo-area">
                <router-link to="/dashboard"><img src="@/assets/venue-logo.svg" class="image-logo" /></router-link>
            </div>
            <div class="menu-items-area">
                <div class="nav-link active">Dashboard</div>
                <div class="course-nav-link nav-link">Courses
                  <div class="course-list-dropdown">
                    <ul>
                      <router-link to="/course_info/123"><li>Course #1</li></router-link>
                      <router-link to="/course_info/123"><li>Course #2</li></router-link>
                      <router-link to="/course_info/123"><li>Course #3</li></router-link>
                      <router-link to="/course_info/123"><li>Course #4</li></router-link>
                    </ul>
                  </div>
                </div>
            </div>
        </div>
        <div class="right-area">
        
            <hide-at breakpoint="small">
                <div class="user-action">
                    <span v-on:click="toggleUserView" :style="{cursor: 'pointer'}">{{ current_user.first_name }} {{ current_user.last_name }}</span>
                    <transition 
                        name="fade"
                        mode="out-in">
                        <div class="user-action-view" v-if="showUserView">
                            <div class="user-action-haeder">
                                <h3 is="sui-header">{{ current_user.first_name }} {{ current_user.last_name }}</h3>
                                <sui-label :style="{backgroundColor: '#ABE5FF'}">
                                    Type
                                    <sui-label-detail>{{ is_instructor ? "Instructor" : "Student" }}</sui-label-detail>
                                </sui-label>
                            </div>
                            <ul class="user-action-menu">
                                <li>Settings</li>
                            </ul>
                            <div class="dropdown-footer">
                                <div class="toggle-theme-area" >
                                    <sui-checkbox label="Dark Mode" toggle v-model="dark_mode" />
                                </div>
                                <div>
                                    <sui-button class="venue-red">Logout</sui-button>
                                </div>
                            </div>
                        </div>
                    </transition>
                </div>
            </hide-at>

        </div>
    </div>
    <div class="navbar-spacer"></div>

    <show-at breakpoint="small">
        <div class="bottom-bar-mobile">
            <sui-dropdown text="David Goldschmidt" direction="upward">
                <sui-dropdown-menu>
                <sui-dropdown-item>Settings</sui-dropdown-item>
                <sui-dropdown-item>Log Out</sui-dropdown-item>
                </sui-dropdown-menu>
            </sui-dropdown>
        </div>
    </show-at>
  </div>

</template>

<script>
  import {showAt, hideAt} from 'vue-breakpoints'
  import UserAPI from '@/services/UserAPI.js';
  import CourseAPI from '@/services/CourseAPI.js'
  import SectionAPI from '@/services/SectionAPI.js'

  export default {
    name: 'NavBar',
    computed: {
      is_dashboard: function () {
        return this.$route.name === 'dashboard'
      },
      is_course_info: function () {
        return this.$route.name === 'course_info'
      },
      is_statistics: function () {
        return this.$route.name === 'statistics'
      }
    },
    props: {
      setDarkModeValue: Function,
      initialDarkModeValue: Boolean,
    },
    components: {
      hideAt,
      showAt
    },
    data(){
      return {
        current_user: {},
        is_instructor: Boolean,
        user_courses: [],
        user_sections: [],
        showUserView: false,
        dark_mode: false
      }
    },
    created() {
      this.dark_mode = this.initialDarkModeValue

      this.getCurrentUser()
      if(this.is_instructor)
        this.getInstructorCourses()
      else
        this.getSectionsWithCourses()
    },
    methods: {
      toggleUserView () {
          console.log("Clicked!")
          this.showUserView = !this.showUserView;
      },

      getCurrentUser() {
        this.current_user = this.$store.state.user.current_user
        this.is_instructor = this.current_user.is_instructor
      },
      async getInstructorCourses() {
        const response = await CourseAPI.getInstructorCourses(this.current_user._id)
        this.user_courses = response.data
      },
      async getSectionsWithCourses() {
        const response = await SectionAPI.getSectionsWithCoursesForStudent(this.current_user._id)
        let temp_sections = response.data
        let temp_course_ids = []
        temp_sections.forEach(section => {
          if(!temp_course_ids.includes(section.course._id)){
            this.user_sections.push(section)
            temp_course_ids.push(section.course._id)
          }
        })
      }
    },
    watch: {
      dark_mode: function (is_dark_mode) {
        this.setDarkModeValue(is_dark_mode);
      }
    }
  }
</script>

<style lang="scss">

.dark-mode, .light-mode {
  
  .venue-navbar {
      height: 93px;
      position: fixed;
      top: 0;
      left: 50px;
      right: 50px;
      z-index: 5;
      align-items: center;
      display: flex;
  }

  .venue-navbar .left-area {
      display: flex;
      height: 100%;
      align-items: center;
      width: 50%;
  }

  .navbar-spacer {
      height: 93px;
  }

  .venue-navbar .right-area {
      width: 50%;
      text-align: right;
  }

  .venue-navbar .left-area .logo-area {
      width: 105px;
      text-align: center;
      height: 40px;
      align-items: center;
  }

  .venue-navbar .left-area .logo-area .image-logo {
      height: 40px;
  }

  .venue-navbar .left-area .menu-items-area {
      display: flex;
  }

  .venue-navbar .course-nav-link {
    cursor: pointer;
    position: relative;
    .course-list-dropdown {
      display: none;
      opacity: 0;

      transition-timing-function: ease-in-out;
      transition: opacity 0.25s;
    }
  }

  .venue-navbar .course-nav-link:hover {
    .course-list-dropdown {
      top: 20px;
      opacity: 1;
      display: block;
    }
  }

  .venue-navbar .left-area .menu-items-area .nav-link {
      font-weight: 600;
      margin-right: 20px;
      font-size: 1rem;
      position: relative;

      .course-list-dropdown {
        position: absolute;
        width: 250px;
        transition: opacity 0.25s;

        ul {
          list-style: none;
          margin: 0;
          padding: 0;

          li {
            height: 30px;
            line-height: 30px;
            box-sizing: border-box;
            padding: 0px 15px;
            cursor: pointer;
            transition: background-color 0.25s;
          }
        }
      }
  }

  .venue-navbar .user-action {
      position: relative;
  }

  .venue-navbar .user-action .user-action-view {
      position: absolute;
      top: 25px;
      right: 0px;
      width: 300px;
      box-sizing: border-box;
      border-radius: 5px;
      border: 1px solid rgba(42, 138, 181, 0.8);
      text-align: left;
      overflow: hidden;
      box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.15);
      z-index: 10;
  }

  .light-mode .venue-navbar .user-action .user-action-view {
      background-color: white;
  }

  .dark-mode .venue-navbar .user-action .user-action-view {
      background-color: #22252e;
  }

  .venue-navbar .user-action .user-action-view .user-action-haeder {
      background-color: #47C4FC;
      padding: 10px 10px 15px 10px;
  }

  .venue-navbar .user-action .user-action-view .user-action-menu {
      list-style: none;
      margin-left: 0;
      padding-left: 0;
      margin-top: 0px;
      margin-bottom: 0px;
  }

  .venue-navbar .user-action .user-action-view .user-action-menu li {
      height: 35px;
      line-height: 35px;
      padding: 0px 10px;
      box-sizing: border-box;
      transition: background-color 0.25s;
  }

  .venue-navbar .user-action .user-action-view .user-action-menu li:hover {
      cursor: pointer;
  }

  .venue-navbar .user-action .user-action-view .dropdown-footer {
      text-align: right;
      margin-right: 20px;
      margin-bottom: 20px;
      margin-top: 20px;
      margin-left: 20px;
      display: flex;
      align-items: center;
  }

  .venue-navbar .user-action .user-action-view .dropdown-footer .toggle-theme-area {
      flex-grow: 1;
      text-align: left;
  }

  .bottom-bar-mobile {
      position: fixed;
      z-index: 10;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50px;
      box-shadow: 0px -3px 2px rgba(0, 0, 0, 0.05);
      display: flex;
      align-items: center;
      padding-left: 50px;
      padding-right: 50px;
  }


  @media only screen and (max-width: 900px) {
      .venue-navbar .left-area .logo-area {
          width: 80px;
          text-align: left;
          height: 40px;
          align-items: center;
          margin-right: 20px;
      }

      .venue-navbar {
          display: flex;
          position: static;
          
      }
      .navbar-spacer {
          height: 0px;
      }
  }
}

.dark-mode {

  .course-list-dropdown {
    background-color: #22252e;
    box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.3);
  }

  .course-list-dropdown li {
    background-color: #22252e;
    color: white;
    font-weight: 400;
  }
  .course-list-dropdown li:hover {
    background-color: #17191f;
  }

  .user-action-view {
    background-color: #22252e;
  }

  .user-action-menu li {
      background-color: #22252e;
  }

  label {
    color: white !important;
  }

  .user-action-menu li:hover {
      background-color: #17191f;
  }

  .venue-navbar .left-area .menu-items-area .nav-link {
    color: #72b3db;
  }
  .venue-navbar .left-area .menu-items-area .nav-link.active {
    border-bottom: 2px solid #72b3db;
  }

  .venue-navbar {
    background-color: #121419;
  }

}

.light-mode {

  .course-list-dropdown {
    background-color: white;
    box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.1);
  }
  
  .course-list-dropdown li {
    background-color: white;
    color: black;
    font-weight: 400;
  }

  .course-list-dropdown li:hover {
    background-color: #f2f3f5;
  }

  .venue-navbar .left-area .menu-items-area .nav-link {
    color: #466D85;
  }
  .venue-navbar .left-area .menu-items-area .nav-link.active {
    border-bottom: 2px solid #466D85;
  }

  .user-action-view {
    background-color: white;
  }

  .user-action-view .user-action-menu li {
      background-color: white;
  }

  .user-action-menu li:hover {
      background-color: #f2f3f5;
  }
  
  .venue-navbar {
    background-color: white;
  }
}

.light-mode .bottom-bar-mobile {
  background-color: white;
}

.dark-mode .bottom-bar-mobile  {
  background-comor: #121419;
}

</style>
