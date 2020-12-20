<template>
  <div>
    <div class="venue-navbar">
      <div class="left-area">

        <hide-at breakpoint="small">
          <div class="logo-area">
            <router-link to="/dashboard"><img src="@/assets/logo.svg" class="image-logo" /></router-link>
          </div>
        </hide-at>

        <hide-at breakpoint="small">
          <div class="menu-items-area">
            <div @click="update ()">
              <router-link to="/dashboard"><div :class="`nav-link ${isPage('dashboard') ? 'active' : ''}`">Dashboard</div></router-link>
            </div>
            <div class="dropdown-collection">
                <div 
                  :class="`course-nav-link nav-link ${isPage('course_info') ? 'active' : ''}`"  
                  v-on:mouseover="focusMenuDropdown('course')"
                  v-on:mouseleave="unfocusMenuDropdown()"
                  @click="update ()">Courses</div>
                <div 
                  :class="`course-nav-link nav-link ${isPage('org_info') ? 'active' : ''}`"
                  v-on:mouseover="focusMenuDropdown('organization')"
                  v-on:mouseleave="unfocusMenuDropdown()"
                  @click="update ()">Organizations</div>

                <div class="dropdown-collection-dropdown">
                  <div
                  v-on:mouseover="focusMenuDropdown('course')"
                  v-on:mouseleave="unfocusMenuDropdown()" 
                  :class="`dropdown-column ${dropdown_focus == 'course' ? 'focus' : 'unfocus'}`">
                    <div class="title">COURSES</div>
                    <div v-if="user_courses && user_courses.length > 0">
                      <ul v-if="is_instructor">
                        <router-link v-for="(course, i) in user_courses" :key="i" :to="`/course_info/${course._id}`" @click="update"><li>{{ course.name }}</li></router-link>
                      </ul>
                      <ul v-else>
                        <router-link v-for="(section, i) in user_courses" :key="i" :to="`/course_info/${section.course._id}`" @click="update"><li>{{ section.course.name }} - {{ section.section_number }}</li></router-link>
                      </ul>
                    </div>
                    <ul v-else>
                      <li>No courses</li>
                    </ul>
                  </div>
                  <div 
                  v-on:mouseover="focusMenuDropdown('organization')"
                  v-on:mouseleave="unfocusMenuDropdown()"
                  :class="`dropdown-column ${dropdown_focus == 'organization' ? 'focus' : 'unfocus'}`">
                    <div class="title">ORGANIZATIONS</div>
                    <ul v-if="user_orgs && user_orgs.length > 0">
                      <router-link v-for="(org, i) in user_orgs" :key="i" :to="{name: 'org_info', params: { id: org._id }}" @click="update"><li>{{ org.name }}</li></router-link>
                    </ul>
                    <ul v-else>
                      <li>No organizations.</li>
                    </ul>
                  </div>
                </div>
                
              </div>
          </div>
        </hide-at>

        <show-at breakpoint="small">
          <div class="mobile-navbar">
            <div class="hamburger-icon" @click="showMobileMenu = true">
              <sui-icon name="bars" />
            </div>
            <div class="logo-area-mobile">
              <router-link to="/dashboard"><img src="@/assets/logo.svg" width="100%" height="100%" class="image-logo" /></router-link>
            </div>
          </div>
        </show-at>

      </div>

      <div class="right-area">
          <show-at breakpoint="small">
            <div>
              <sui-button icon="cog" @click="showMobileUserAction = true" />
            </div>
          </show-at>
          <hide-at breakpoint="small">
              <div class="user-action">
                <div :style="{display: 'inline-block'}">
                  <show-at breakpoint="large">
                    <sui-button compact icon="cog" 
                      id="user-action-toggle-button"
                      label-position="left" 
                      :content="`${current_user.first_name} ${current_user.last_name}`"
                      @click="toggleUserView"
                    />
                  </show-at>
                  <hide-at breakpoint="large">
                    <sui-button
                      id="user-action-toggle-button-min"
                      icon="cog"
                      @click="toggleUserView"
                    />
                  </hide-at>
                </div>
                  <!-- <span v-on:click="toggleUserView" :style="{cursor: 'pointer'}">
                    {{ current_user.first_name }} {{ current_user.last_name }}
                    </span> -->
                  <transition 
                      name="fade"
                      mode="out-in">
                      <div class="user-action-view" id="user-action-modal" v-if="showUserView">
                          <div class="user-action-header">
                              <h3 is="sui-header">{{ current_user.first_name }} {{ current_user.last_name }}</h3>
                              <sui-label :style="{backgroundColor: '#ABE5FF'}">
                                  Type
                                  <sui-label-detail>{{ is_instructor ? "Instructor" : "Student" }}</sui-label-detail>
                              </sui-label>
                              <div class="register-course-btn">
                                <router-link v-if="is_instructor" :to="{name: 'register_course'}"
                                class="register-course-btn">
                                  <sui-button size="small" color="black"
                                  >Register New Course</sui-button>
                                </router-link>
                                <router-link v-else :to="{name: 'join_course'}"
                                class="register-course-btn">
                                  <sui-button size="small" color="black"
                                  >Join Course</sui-button>
                                </router-link>
                              </div>
                          </div>
                          <ul class="user-action-menu">
                              <li>Settings</li>
                          </ul>
                          <div class="dropdown-footer">
                              <div class="toggle-theme-area" >
                                  <sui-checkbox label="Dark Mode" toggle v-model="dark_mode" />
                              </div>
                              <div>
                                  <sui-button class="venue-red" @click="logoutUser ()">Logout</sui-button>
                              </div>
                          </div>
                      </div>
                  </transition>
              </div>
          </hide-at>

      </div>
  </div>
  <div class="navbar-spacer"></div>

  <!-- SLIDE MENU -->
  <show-at breakpoint="small" v-if="showMobileMenu">
    <transition name="fade" mode="out-in">
      <div class="off-canvas-menu-back" @click="showMobileMenu = false">
        <div class="off-canvas-menu left">

          <ul>
            <router-link to="/dashboard"><li>Dashboard</li></router-link>
            <li v-if="user_courses && user_courses.length > 0">Courses
              <ul v-if="is_instructor">
                <router-link v-for="(course, i) in user_courses" :key="i" :to="`/course_info/${course._id}`" @click="update"><li>{{ course.name }}</li></router-link>
              </ul>
              <ul v-else>
                <router-link v-for="(section, i) in user_courses" :key="i" :to="`/course_info/${section.course._id}`" @click="update"><li>{{ section.course.name }} - {{ section.section_number }}</li></router-link>
              </ul>
            </li>
            <li v-if="user_orgs && user_orgs.length > 0">Organizations
              <ul>
                <router-link v-for="(org, i) in user_orgs" :key="i" :to="{name: 'org_info', params: { id: org._id }}" @click="update"><li>{{ org.name }}</li></router-link>
              </ul>
            </li>
          </ul>

        </div>
      </div>
    </transition>
  </show-at>
  <!-- MOBILE SETTINGS SLIDE MENU -->
  <show-at breakpoint="small" v-if="showMobileUserAction">
    <transition name="fade" mode="out-in">
      <div class="off-canvas-menu-back" @click="showMobileUserAction = false">
        <div class="off-canvas-menu right">

          <div class="user-fullname-area">
            {{ current_user.first_name }} {{ current_user.last_name }}
          </div>

          <div class="actions-area">

          </div>

          <div class="logout-area">
            <sui-button class="venue-red" @click="logoutUser ()">Logout</sui-button>
          </div>

        </div>
      </div>
    </transition>
  </show-at>

  </div>
</template>

<script>
  import {showAt, hideAt} from 'vue-breakpoints'
  import UserAPI from '@/services/UserAPI.js';
  import CourseAPI from '@/services/CourseAPI.js'
  import SectionAPI from '@/services/SectionAPI.js'
  import OrgAPI from '@/services/OrgAPI.js'
  import AuthAPI from '@/services/AuthAPI.js'
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
      initialDarkModeValue: Boolean
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
        dark_mode: false,
        user_orgs: [],
        dropdown_focus: '',
        showMobileMenu: false,
        showMobileUserAction: false
      }
    },
    created() {
      window.addEventListener('click', this.handleUserModal)
      this.dark_mode = this.initialDarkModeValue
      this.getCurrentUser()
    },
    methods: {
      toggleMobileMenu () {
        this.push = true
      },
      focusMenuDropdown (focus_key) {
        this.dropdown_focus = focus_key
      },
      unfocusMenuDropdown () {
        this.focusDropdown = ""
      },
      handleUserModal (e) {
        // console.log(`Window: clicked`)
        let modal_ = document.getElementById('user-action-modal')
        let userActionControl = document.getElementById('user-action-toggle-button')
        if (!userActionControl) userActionControl = document.getElementById('user-action-toggle-button-min')
        let target_ = e.target
        if (target_ == userActionControl) return;
        
        if (this.showUserView && !this.withinSource (target_, modal_)) {
          this.showUserView = false
        }
      },
      withinSource (focus, target) {
        // check whether target == focus, or if any of focus's parents == target
        if (focus == document) return false;
        if (target == focus) return true;
        return this.withinSource (focus.parentNode, target);
      },
      update () {
        this.$forceUpdate()
      },
      isPage (page_val) {
        // console.log(this.$route.name)
        return this.$route.name == page_val
      },
      logoutUser() {
        AuthAPI.logoutCAS().then(res => {
          this.$store.dispatch('logout')
        })
      },
      toggleUserView () {
        console.log(`CLICKED`)
        this.showUserView = !this.showUserView;
      },
      async getCurrentUser() {
        this.current_user = this.$store.state.user.current_user
        this.is_instructor = this.current_user.is_instructor
        const response = await UserAPI.getUser(this.current_user._id)
        let user = response.data
        if (user.is_instructor)
          this.user_courses = user.instructor_courses
        else
          this.user_courses = user.student_sections
        this.user_orgs = user.user_orgs
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
.register-course-btn {
  margin-top: 1rem;
}

.dark-mode {
  .off-canvas-menu {
    color: white;
    background-color: #121419;
    ul {
      li {
        color: white;
      }
    }
  }
}
.light-mode {
  .off-canvas-menu {
    color: black;
    background-color: white;
    ul {
      li {
        color: black;
      }
    }
  }
}
.dark-mode, .light-mode {
  
  .off-canvas-menu-back {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.3);
    z-index: 1000000000;
    
    .off-canvas-menu {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 300px;
      z-index: 10000000000;
      box-sizing: border-box;
      padding: 50px;
      &.left {
        left: 0;
      }
      &.right {
        right: 0;
        .user-fullname-area {
          font-size: 2rem;
          line-height: 35px;
          margin-bottom: 20px;
        }
      }
      ul {
        list-style: none;
        margin: 0;
        padding: 0;
        li {
          font-size: 1.5rem;
          margin-bottom: 20px;
          ul {
            margin-left: 30px;
            margin-top: 20px;
          }
        }
      }
    }
  }
  .mobile-navbar {
    .logo-area-mobile {
      width: 40px;
      height: 40px;
      display: inline-block;
      vertical-align: top;
    }
    .hamburger-icon {
      display: inline-block;
      width: 27px;
      height: 40px;
      line-height: 40px;
      margin-right: 15px;
      vertical-align: top;
      text-align: left;
      font-size: 1.5rem;
      cursor: pointer;
    }
  }
  .venue-navbar {
      height: 70px;
      position: fixed;
      top: 0;
      left: 20px;
      right: 20px;
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
      width: 70px;
      min-width: 70px;
      text-align: center;
      height: 40px;
      align-items: center;
  }
  .venue-navbar .left-area .logo-area .image-logo {
      height: 40px;
  }
  .venue-navbar .left-area .menu-items-area {
      display: flex;
      .dropdown-collection {
        display: flex;
        position: relative;
        .course-nav-link {
          width: 140px;
          text-align: center;
        }
        &:hover {
          .dropdown-collection-dropdown {
            visibility: visible;
            opacity: 1;
          transform: translateY(-2px);
          }
        }
        .dropdown-collection-dropdown {
          border-radius: 4px;
          transition: visibility 0.2s, opacity 0.25s, transform 0.25s;
          transform: translateY(20px);
          opacity: 0;
          visibility: hidden;
          position: absolute;
          top: 45px;
          display: flex;
          padding: 10px 0;
          box-sizing: border-box;
          .dropdown-column{
            width: 140px;
            margin-right: 20px;
            box-sizing: border-box;
            padding-left: 20px;
            transition: opacity 0.25s;
            &.focus {
              opacity: 1;
            }
            &.unfocus {
              opacity: 0.6;
            }
            .title {
              font-size: 0.75rem;
              opacity: 0.5;
            }
            ul {
              margin: 10px 0 0 0;
              padding: 0;
              list-style: none;
              li {
                font-size: 0.9rem;
                margin-bottom: 3px;
              }
            }
          }
        }
      }
  }
  .venue-navbar .course-nav-link {
    cursor: pointer;
    position: relative;
    &:hover {
      .course-list-dropdown {
        opacity: 1;
        visibility: visible;
        transform: translate(0px, -2px);
        transition: opacity 0.25s, transform 0.35s, visibility 0.35s;
      }
    }
    .course-list-dropdown {
      opacity: 0;
      transition-timing-function: ease-in-out;
      transition: opacity 0.25s, transform 0.35s, visibility 0.35s;
      visibility: hidden;
      position: absolute;
      width: 250px;
      transform: translate(0px, 20px);
      border-radius: 5px;
      overflow: hidden;
      left: 0;
      z-index: 10;
      ul {
        list-style: none;
        margin: 0;
        padding: 0;
        li {
          height: 40px;
          line-height: 40px;
          box-sizing: border-box;
          padding: 0px 15px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.25s;
        }
      }
    }
  }
  // .venue-navbar .course-nav-link:hover {
  //   .course-list-dropdown {
  //     opacity: 1;
  //     visibility: visible;
  //     transform: translate(0, 0px);
  //   }
  // }
  .venue-navbar .left-area .menu-items-area .nav-link {
      font-weight: 600;
      margin-right: 20px;
      font-size: 1rem;
      position: relative;
      height: 40px;
      line-height: 40px;
      padding: 0 15px;
  }
  .venue-navbar .user-action {
      position: relative;
  }
  .venue-navbar .user-action .user-action-view {
      position: absolute;
      top: 40px;
      right: 0px;
      width: 300px;
      box-sizing: border-box;
      border-radius: 5px;
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
  .venue-navbar .user-action .user-action-view .user-action-header {
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
  .dropdown-collection-dropdown {
    background-color: #22252e;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.2);
    .dropdown-column {
      ul {
        li {
          color: white;
        }
      }
    }
  }
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
  .dropdown-collection-dropdown {
    background-color: white;
    border: 1px solid rgba(0, 0, 0, 0.2);
    box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.1);
    .dropdown-column {
      ul {
        li {
          color: black;
        }
      }
    }
  }
  .course-list-dropdown {
    background-color: white;
    box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.2);
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
    opacity: 0.8;
    transition: opacity 0.25s;
  }
  .venue-navbar .left-area .menu-items-area .nav-link:hover {
    opacity: 0.85;
  }
  .venue-navbar .left-area .menu-items-area .nav-link.active {
    border-bottom: 2px solid #466D85;
    opacity: 1;
  }
  .user-action-view {
    background-color: white;
    border: 1px solid rgba(0, 0, 0, 0.3);
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
  background-color: #121419;
}
</style>