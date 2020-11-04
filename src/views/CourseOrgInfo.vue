<template>
  <div class="course-info">
    <div class="header">
      <!-- Page Title -->
      <div class="page-title" v-if="for_course">Course Info</div>
      <div class="page-title" v-else>Org Info</div>
        <div class="page-info-area">
          <!-- Meeting Info Side -->
          <div class="left-side">
            <h2>{{ for_course ? course.name : org.name }}</h2>
            <div class="details-area">
              <sui-label v-if="for_course && course.course_number" class="venue-red" :style="{marginBottom: '5px'}">
                  Dept
                  <sui-label-detail>{{ course.dept }} {{ getFormattedCourseNumber(course.course_number) }}</sui-label-detail>
              </sui-label>
            </div>
          </div>
          <div class="right-side">
            <div class="tabs">
              <ul>
                <li @click="activeTab = 'meeting_history'" :class="activeTab == 'meeting_history' ? 'active' : ''">
                  Meeting History</li>
                <li @click="activeTab = 'statistics'" :class="activeTab == 'statistics' ? 'active' : ''">
                  <div class="icon-box"><i class="icon chart line"></i></div>
                  <div>Statistics</div>
                </li>
                <li v-if="for_course && current_user.is_instructor" 
                  @click="activeTab = 'manage_students'" 
                  :class="activeTab == 'manage_students' ? 'active' : ''">Manage Students
                </li>
                <li v-else-if="!for_course && is_board_member" @click="activeTab = 'members'" :class="activeTab == 'members' ? 'active' : ''">Members</li>
              </ul>
            </div>
            <div class="actions">
              <router-link :to="for_course ? {name: 'course_new_meeting', params: { course_id: course._id }} : {name: 'org_new_meeting', params: { org_id: org._id }}">
                <sui-button
                  v-if="isPrivelegedUser()"
                  class="labeled
                  icon venue-green"
                    icon="plus"
                    button
                  >
                  Schedule Meeting
                </sui-button>
              </router-link>
            </div>
          </div>
        </div>
    </div>

    <!-- Sidebar Area -->
    <div class="sidebar-area">
      <transition
          name="fade"
          mode="out-in"
        >
        <div class="manage-students-section-selector" key="1" v-if="activeTab == 'manage_students'">
<!--           <ul>
            <li class="active">Section 1</li>
            <li>Section 2</li>
            <li>Section 3</li>
            <li>Section 4</li>
          </ul> -->
        </div>
        <!-- Sidebar Statistics Controller -->
        <div class="statistics-controller-sidebar" key="2" v-if="activeTab == 'statistics'">
          <!-- Sections Selector -->
<!--           <div class="section-selector">
            <sui-button 
              :style="{backgroundColor: `${statisticsSections[section].display ? colorSets[index].stroke : '#e8e8e8'}`}"
              v-for="(section, index) in Object.keys(statisticsSections)" @click="toggleSectionStatistics(section)">Section X</sui-button>
          </div> -->
        </div>
      </transition>
    </div>

    <div class="top-spacer"></div>
    <div class="content-area-wrapper">
      <div class="left-spacer"></div>
      <!-- Content Area -->
      <div class="content-area">
        <transition-group
          name="fade"
          mode="out-in"
        >
          <div v-if="activeTab == 'meeting_history'" key="1">
            <h3>January</h3>
            <div v-if="for_course" class="attendance-for-month">
              <MeetingAttendancePill v-for="meeting in course.meetings" :key="meeting._id" v-bind:meeting="meeting" />
            </div>
            <div v-else class="attendance-for-month">
              <MeetingAttendancePill v-for="meeting in org.meetings" :key="meeting._id" v-bind:meeting="meeting" />
            </div>
          </div>
          <!-- For instructors, show CourseStatistics. -->
          <!-- For students, show StudentStatistics. -->
<!--           <CourseStatistics
            v-if="activeTab == 'statistics'"
            key="2"
            v-bind:colorSets="colorSets"
          /> -->
          <div v-if="activeTab === 'statistics'" key="2">
            <CourseStudentList
            v-if="show_student_list"
            v-bind:students="course.students"
            v-on:show-student-stats="showStudentStats" />
            <StudentStats v-else
            v-bind:student="focused_student"
            v-bind:course="course"
            v-on:show-student-list="showStudentList" />
          </div>
          <div key="3" v-if="activeTab === 'manage_students' || activeTab === 'members' ">
            <ManageStudents v-if="for_course" v-bind:course="course" />
            <ManageStudents v-else v-bind:org="org" />
          </div>
          <!-- <h3 style="text-align: center;" v-else-if="activeTab == 'settings'">Coming soon...</h3> -->
        </transition-group>
      </div>
    </div>

  </div>

</template>

<script>
import MeetingAttendancePill from "@/components/MeetingAttendancePill"
import ManageStudents from "@/components/ManageStudents.vue"
import CourseStatistics from "@/components/CourseStatistics.vue"
import CourseAPI from "@/services/CourseAPI"
import OrgAPI from "@/services/OrgAPI"
import CourseStudentList from "@/components/CourseStudentList"
import StudentStats from "@/components/StudentStats"

export default {
    name: 'CourseOrgInfo',
    components: {
      MeetingAttendancePill,
      ManageStudents,
      CourseStatistics,
      CourseStudentList,
      StudentStats
    },
    data () {
      return {
        activeTab: 'meeting_history',
        showManageStudents: true,
        statisticsSections: {},
        colorSets: [],
        course: {},
        org: {},
        current_user: {},
        for_course: false,
        is_board_member: false,
        show_student_list: true,
        focused_student: null
      }
    },
    async created () {
      this.current_user = this.$store.state.user.current_user
      this.is_instructor = this.current_user.is_instructor
      await this.getCourseOrOrg();
      if(!this.for_course)
        this.checkIfCurrentUserIsBoardMember()
      // attach resize function to window
      window.addEventListener('resize', this.disableMobileTabs)
    },
    methods: {
      async getCourseOrOrg () {
        if(this.$route.name === "course_info"){
          this.course_id = this.$route.params.id;
          this.for_course = true
          const response = await CourseAPI.getCourse(this.course_id)
          this.course = response.data
        } else {
          this.org_id = this.$route.params.id;
          const response = await OrgAPI.getOrg(this.org_id)
          this.org = response.data
        }
      },
      checkIfCurrentUserIsBoardMember() {
        let org_board_members = this.org.board_members
        for(let i = 0; i < org_board_members.length; i++) {
          if(org_board_members[i].user_id === this.current_user.user_id) {
            this.is_board_member = true
            break
          }
        }
      },
      disableMobileTabs (e) {
        let width = e.target.outerWidth
        if (width < 950 && this.activeTab == 'manage_students') {
          this.activeTab = 'meeting_history';
          this.showManageStudents = false
        }
        if  (width >= 950 && !this.showManageStudents) this.showManageStudents = true
      },
      showStudentStats(student) {
        this.focused_student = student
        this.show_student_list = false
      },
      showStudentList(student) {
        this.focused_student = null
        this.show_student_list = true
      },
      toggleSectionStatistics(section) {
        this.statisticsSections[section].display = !this.statisticsSections[section].display
      },
      getFormattedCourseNumber(course_number) {
        let course_number_str = course_number.toString()
        let num_digits = course_number_str.length
        if(num_digits <= 4) {
          return course_number
        } else {
          return course_number_str.slice(0,4) + "/" + course_number_str.slice(4,num_digits)
        }
      },
      isPrivelegedUser() {
        console.log("for course", this.for_course)
        console.log("Is instructor", this.is_instructor)
        console.log("is_board_member", this.is_board_member)
        return (this.for_course && this.is_instructor) || (!this.for_course && this.is_board_member)
      }
    }
}
</script>

<style lang="scss">
.course-info {
    // Header, With title and Schedule Slider
    margin: auto;
    .header {
        position: fixed;
        left: 90px;
        top: 70px;
        right: 20px;
        z-index: 3;
        .page-title {
            font-weight: 600;
        }
        .page-info-area {
            display: flex;
            .left-side {
                width: 320px;
                min-height: 75px;
                min-width: 320px;
            }
            .right-side {
                flex-grow: 1;
                position: relative;
                .actions {
                  text-align: right;
                }
                .tabs {
                  position: absolute;
                  bottom: 0;
                  left: 0;
                  ul {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    li {
                      display: inline-block;
                      padding: 0 15px;
                      height: 30px;
                      font-weight: 600;
                      cursor: pointer;
                      transition: border 0.25s, border-bottom 0.25s, opacity 0.25s;
                      opacity: 0.7;
                      border-bottom: 2px solid rgba(0, 0, 0, 0);
                      div {
                        display: inline-block;
                        font-weight: 600;
                      }
                      .icon-box {
                        margin-right: 10px;
                      }
                    }
                    li:hover {
                      opacity: 0.85;
                    }
                    li.active {
                      opacity: 1;
                    }
                    li.active:hover {
                      opacity: 1;
                    }
                  }
                }
            }
        }
    }
    .top-spacer {
        height: 87px;
    }
    .left-spacer {
        width: 320px;
        min-width: 320px;
    }
    // Left Hand Side Area
    .sidebar-area {
        width: 300px;
        // background-color: green;
        position: fixed;
        bottom: 0;
        top: 180px;
        left: 90px;
        right: 50px;
        z-index: 3;
        .manage-students-section-selector {
          margin-top: 30px;
          margin-bottom: 30px;
          text-align: right;
          ul {
            margin: 0;
            padding: 0;
            list-style: none;
            li {
              font-weight: 600;
              cursor: pointer;
              height: 40px;
              line-height: 40px;
              padding-right: 20px;
              border-right: 2px solid rgba(0, 0, 0, 0);
              transition: border 0.25s;
            }
          }
        }
        .statistics-controller-sidebar {
          
          margin-top: 30px;
          margin-bottom: 30px;
          .section-selector {
            
            .ui.button {
              margin-bottom: 10px;
            }
          }
        }
    }
    // Main body area
    .content-area-wrapper {
        display: flex;
    }
    .content-area {
        position: relative;
        width: 72%;
        margin-right: 30px;
        box-sizing: border-box;
        .attendance-for-month {
          
        }
        .title {
            margin-top: 10px;
            margin-bottom: 10px;
        }
    }
}
.dark-mode {
    .course-info {
        .page-title {
            background-color: #121419;
        }
        .page-info-area {
            .left-side {
                background-color: #121419;
            }
            .right-side {
                background-color: #121419;
                
                .tabs {
                  ul {
                    li.active {
                      border-bottom: 2px solid white;
                    }
                  }
                }
            }
        }
        .sidebar-area {
          .manage-students-section-selector {
            ul {
              li.active {
                border-right: 2px solid #47C4FC;
              }
              li.active:hover {
                border-right: 2px solid #47C4FC;
              }
              li:hover {
                border-right: 2px solid rgba(255, 255, 255, 0.6);
              }
            }
          }
        }
    }
}
.light-mode {
    .course-info {
        .page-title {
            background-color: white;
        }
        .page-info-area {
            .left-side {
                background-color: white;
            }
            .right-side {
                background-color: white;
                .tabs {
                  ul {
                    li.active {
                      border-bottom: 2px solid black;
                    }
                  }
                }
            }
        }
    }
    .sidebar-area {
      .manage-students-section-selector {
        ul {
          li.active {
            border-right: 2px solid #47C4FC;
          }
          li.active:hover {
            border-right: 2px solid #47C4FC;
          }
          li:hover {
            border-right: 2px solid rgba(0, 0, 0, 0.6);
          }
        }
      }
    }
}
@media only screen and (max-width: 900px) {
  .course-info {
    .header {
        position: relative;
        display: contents;
        
        .page-info-area {
            display: block;
            .left-side {
                width: 100%;
            }
            .right-side {
                width: 100%;
                position: relative;
                margin-top: 80px;
                margin-bottom: 40px;
            }
        }
    }
    .sidebar-area {
        position: static;
        display: contents;
    }
    .top-spacer {
        height: 0px;
    }
    .left-spacer {
        width: 0px;
        min-width: 0px;
    }
    .content-area {
        position: relative;
        width: 100%;
    }
  }
}
</style>