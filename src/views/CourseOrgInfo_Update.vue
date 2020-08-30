<template>

  <div class="course-info-page">

    <!-- Header Area -->
    <div class="header-area">
      <div class="left-side">
        <div class="title"><h3>{{
          for_course ? course.name : org.name
        }}</h3></div>
      </div>
      <div class="right-side">
        <sui-button 
          compact 
          icon="plus" 
          label-position="left" 
          content="Invite Students" 
          class="venue-orange"
        />
        <router-link :to="for_course ? 
        {name: 'course_new_meeting', params: { course_id: course._id }} 
        : {name: 'org_new_meeting', params: { org_id: org._id }}">
        <sui-button 
          compact 
          icon="plus" 
          label-position="left" 
          content="Schedule Meeting" 
          class="venue-green"
        />
        </router-link>
      </div>
    </div>

    <!-- Body Area -->
    <show-at breakpoint="small">

      <div class="mobile-navbar">
        
        <div class="mobile-navbar-container">

          <div class="navbar-area">

            <div @click="active_tab = 'course_info'" :class="`navbar-option ${active_tab == 'course_info' ? 'active' : ''}`">
              <div class="icon-area"><sui-icon name="info" /></div>
              <div class="navbar-label-area">Course Info</div>
            </div>

            <div @click="active_tab = 'statistics'" :class="`navbar-option ${active_tab == 'statistics' ? 'active' : ''}`">
              <div class="icon-area"><sui-icon name="chart line" /></div>
              <div class="navbar-label-area">Statistics</div>
            </div>

            <div v-if="current_user.is_instructor" @click="active_tab = 'manage_students'" :class="`navbar-option ${active_tab == 'manage_students' ? 'active' : ''}`">
              <div class="icon-area"><sui-icon name="users" /></div>
              <div class="navbar-label-area">Manage Students</div>
            </div>

          </div>

        </div>

      </div>

    </show-at>
    <div class="body-area">
      <hide-at breakpoint="small">

        <div class="left-navbar">
        
          <div class="navbar-area">
            <div @click="active_tab = 'course_info'" :class="`navbar-option ${active_tab == 'course_info' ? 'active' : ''}`">
              <div class="icon-area"><sui-icon name="info" /></div>
              <div class="text-area">Course Info</div>
            </div>
            <div @click="active_tab = 'statistics'" :class="`navbar-option ${active_tab == 'statistics' ? 'active' : ''}`">
              <div class="icon-area"><sui-icon name="chart line" /></div>
              <div class="text-area">Statistics</div>
            </div>
            <div v-if="current_user.is_instructor" @click="active_tab = 'manage_students'" :class="`navbar-option ${active_tab == 'manage_students' ? 'active' : ''}`">
              <div class="icon-area"><sui-icon name="users" /></div>
              <div class="text-area">Manage Students</div>
            </div>
          </div>

        </div>

      </hide-at>
      <div class="content">

        <transition name="fade" mode="out-in">

          <!-- Course Info -->
          <div class="section" :key="1" v-if="active_tab == 'course_info'">
            <div class="title-area"><h4>Course Info</h4></div>

            <div class="body-area">
              <div v-if="getMeetings() && getMeetings().length > 0">
                <MeetingAttendancePill 
                  v-for="(meeting, i) in getMeetings()"
                  :key="i"
                  :meeting="meeting"
                />
              </div>
              <div :style="{textAlign: 'center', width: '100%'}" v-else>
                No meetings available
              </div>
            </div>

          </div>

          <!-- Statistics -->
          <div class="section" :key="2" v-if="active_tab == 'statistics'">
            <div class="title-area"><h4>Statistics</h4></div>
          </div>
          
          <!-- Manage Students -->
          <div class="section" :key="3" v-if="active_tab == 'manage_students'">
            <div class="title-area"><h4>Manage Students</h4></div>

            <div class="body-area">
              <StudentList :students="getStudents ()" />
            </div>
          </div>

        </transition>
      </div>
    </div>
  </div>

</template>
<script>
import StudentList from '@/components/StudentList.vue'
import MeetingAttendancePill from '@/components/MeetingAttendancePill_New.vue'
import {showAt, hideAt} from 'vue-breakpoints'
import CourseAPI from "@/services/CourseAPI"
import OrgAPI from "@/services/OrgAPI"
export default {
  name: 'CourseOrgInfo',
  components: {
    showAt, hideAt,
    MeetingAttendancePill,
    StudentList
  },
  data () {
    return {
      active_tab: 'course_info',
      current_user: {},
      for_course: false,
      course: {},
      org: {},

    }
  },
  async created () {
      this.getCurrentUser()
      await this.getCourseOrOrg();
  },
  methods: {
    getCurrentUser() {
      this.current_user = this.$store.state.user.current_user
    },
    async getCourseOrOrg () {
      if(this.$route.name === "course_info"){
        let course_id = this.$route.params.id;
        this.for_course = true
        const response = await CourseAPI.getCourse(course_id)
        this.course = response.data
      } else {
        let org_id = this.$route.params.id;
        const response = await OrgAPI.getOrg(org_id)
        this.org = response.data
      }
    },
    getMeetings () {
      if (this.for_course) return this.course.meetings
      else return this.org.course_meetings
    },
    getStudents () {
      if (this.for_course) return this.course.students
      else return this.org.general_members
    }
  }
}
</script>
<style lang="scss">
.course-info-page {

  .header-area {
    margin-bottom: 20px;
    display: flex;
    align-items: center;

    .left-side {
      flex-grow: 1;
    }
  }

  .mobile-navbar {
    display: block;
    width: 100%;
    height: 60px;
    margin-bottom: 20px;

    .navbar-area {
      border-radius: 5px;
      overflow: hidden;
      cursor: pointer;
      display: flex;
      text-align: center;
      width: 370px;
      margin: 0 auto;
      height: 60px;

      .navbar-option {
        width: 200px;
        padding-top: 10px;
        transition: background 0.25s;

        .icon-area {
          font-size: 1.3rem;
          margin-bottom: 5px;
        }

        .navbar-label-area {
          font-size: 0.65em;
          text-transform: uppercase;
        }
      }
    }
  }

  .title-area {
    margin-bottom: 10px;
  }

  .body-area {
    display: flex;

    .left-navbar {
      width: 300px;
      min-width: 300px;
      margin-right: 25px;

      .navbar-area {
        padding: 15px 15px;
        border-radius: 5px;
        box-sizing: border-box;

        .navbar-option {
          border-radius: 5px;
          margin-bottom: 15px;
          display: flex;
          height: 35px;
          align-items: center;
          cursor: pointer;
          transition: background 0.25s, transform 0.25s;
          transform: scale(1);

          &:active {
            transform: scale(0.95);
          }

          &:last-child {
            margin-bottom: 0;
          }

          .icon-area {
            width: 55px;
            min-width: 55px;
            text-align: center;
          }

          .text-area {
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85rem;
          }
        }
      }
    }
    .content {
      flex-grow: 1;

      .section {

        .body-area {
          display: flex;
          flex-wrap: wrap;
        }
      }
    }
  }
}

.light-mode {
  .navbar-area {
    background-color: #D5EFFF;

    .navbar-option {
      background-color: rgba(0, 0, 0, 0);
      &:hover {
        background-color: #ade0ff;
      }

      &.active {
        background-color: #A2DCFF;
      }
    }
  }
}

.dark-mode {
  .navbar-area {
    background-color: #282c36;

    .navbar-option {
      background-color: rgba(0, 0, 0, 0);
      &:hover {
        background-color: #3c414d;
      }

      &.active {
        background-color: #494e5c;
      }
    }
  }
}

@media only screen and (max-width: 670px) {
  .body-area {
  }
}
</style>