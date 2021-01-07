<template>
  <div id="course-info">
    <div class="course-info-container" id="side-bar">
      <h2 id="course-name">Data Structures</h2>
      <h3 id="course-number">CSCI 1200</h3>
      <div class="side-bar-link-container">
        <div @click="showSection('meetings')"
        class="side-bar-link-wrapper" id="meetings-wrapper">
          <sui-icon name="users" />
          <p class="side-bar-link">Meetings</p>
        </div>
      </div>
      <div class="side-bar-link-container">
        <div @click="showSection('statistics')"
        class="side-bar-link-wrapper" id="statistics-wrapper">      
          <sui-icon name="chart bar" />
          <p class="side-bar-link">Statistics</p>
        </div>
      </div>
      <div class="side-bar-link-container">
        <div @click="showSection('roster')"
        class="side-bar-link-wrapper" id="roster-wrapper">
          <sui-icon name="user circle outline" />
          <p class="side-bar-link">Roster</p>
        </div>
      </div>
      <div class="side-bar-link-container">
        <div @click="showSection('settings')"
        class="side-bar-link-wrapper" id="settings-wrapper">
          <sui-icon name="cog" />
          <p class="side-bar-link">Settings</p>
        </div>
      </div>
      <h3>Instructors</h3>
      <div class="side-bar-link-container">
        <sui-icon name="graduation cap" />
        <p class="side-bar-link">John Doe</p>
      </div>
      <div class="side-bar-link-container">
        <sui-icon name="graduation cap" />
        <p class="side-bar-link">Steven Smith</p>
      </div>
    </div>

    <div v-if="!course_has_loaded">
      <sui-loader active name="Loading Course" />
    </div>
    <div v-else class="course-info-container" id="main">
      <transition name="fade" mode="out-in">
        <div v-if="active_section === 'meetings'" id="meetings-section">
          <div id="meetings-section-header-container">
            <div id="meetings-section-header">Meetings</div>
            <div>
              <sui-dropdown selection
              placeholder="All sections"
              :options="section_selector_options"
              v-model="selected_section" />
              <router-link :to="{name: 'course_new_meeting',
              params: {course_id: course._id}}">
                <sui-button animated size="small"
                  style="background-color:#00b80c; color:white;
                  float:right;">
                  <sui-button-content visible>
                    Schedule Meeting
                  </sui-button-content>
                  <sui-button-content hidden>
                    <sui-icon name="calendar plus" />
                  </sui-button-content>
                </sui-button>
              </router-link>
            </div>
          </div>
          <CourseMeetingsForMonthContainer month="March"
          :meetings="meetings" />
          <CourseMeetingsForMonthContainer month="Februrary"
          :meetings="meetings" />
        </div>
      </transition>
      <transition name="fade" mode="">
        <div v-if="active_section === 'statistics'"
        id="roster-section">
        <h1>Coming Soon...</h1>
        </div>
      </transition>
      <transition name="fade" mode="out-in">
        <div v-if="active_section === 'roster'"
        id="roster-section">
          <SectionInfoContainer :section="section1" />
          <SectionInfoContainer :section="section2" />
        </div>
      </transition>
      <transition name="fade" mode="out-in">
        <h1 v-if="active_section === 'settings'">Coming Soon...</h1>
      </transition>
    </div>
  </div>
</template>

<script>
import CourseMeetingsForMonthContainer from
'@/components/CourseMeetingsForMonthContainer'
import SectionInfoContainer from
'@/components/SectionInfoContainer'
import CourseAPI from '@/services/CourseAPI'

export default {
  name: 'CourseInfo',
  components: {
    CourseMeetingsForMonthContainer,
    SectionInfoContainer
  },
  data () {
    return {
      course: {},
      active_section: "",
      section_selector_options: [
        {
          text: "All Sections",
          value: 1
        },
        {
          text: "Section 1",
          value: 2
        },
        {
          text: "Section 2",
          value: 3
        },
      ],
      selected_section: null,
      meetings: [],
      students: [],
      section1: {
        section_number: 1,
        students: [],
        invited_students: [],
        pending_approval_students: []
      },
      section2: {
        section_number: 2,
        students: [],
        invited_students: [],
        pending_approval_students: []
      },
      course_has_loaded: false
    }
  },
  async created () {
    if(this.$route.params.reload_page)
      this.$router.go()
    await this.getCourse()
    this.setFakeMeetings()
    this.setFakeStudents()
    this.course_has_loaded = true
    // this.selected_section = this.section_selector_options[0].text
    // console.log("selected", this.selected_section)
  },
  mounted () {
    this.showSection("meetings")
  },
  methods: {
    async getCourse() {
      try {
        const response = await CourseAPI.getCourse(
          this.$route.params.id)
        this.course = response.data
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong getting your course")
      }
    },
    showSection(section_name) {
      if(this.active_section !== "") {
        let active_section_wrapper = this.getSectionWrapper(
          this.active_section)
        active_section_wrapper.classList.remove("active-section")
      }
      let section_wrapper = this.getSectionWrapper(section_name)
      section_wrapper.classList.add("active-section")
      this.active_section = section_name
    },
    getSectionWrapper(section_name) {
      return document.getElementById(
        `${section_name}-wrapper`)
    },
    setFakeMeetings() {
      this.meetings.push({
        title: "Meeting 1",
        real_time_portion: {
          qr_scans: [{
            code: "some_code"
          }]
        },
        async_portion: {
          videos: [{
            video_url: "some_url"
          }]
        },
        _id: "abc"
      })
      this.meetings.push({
        title: "Meeting 2",
        real_time_portion: {
          qr_scans: [{
            code: "some_code"
          }]
        },
        async_portion: {
          videos: []
        },
        _id: "def"
      })
      this.meetings.push({
        title: "Meeting 3",
        real_time_portion: {
          qr_scans: []
        },
        async_portion: {
          videos: [{
            video_url: "some_url"
          }]
        },
        _id: "ghi"
      })
      this.meetings.push({
        title: "Meeting 1",
        real_time_portion: {
          qr_scans: [{
            code: "some_code"
          }]
        },
        async_portion: {
          videos: [{
            video_url: "some_url"
          }]
        },
        _id: "jkl"
      })
      this.meetings.push({
        title: "Meeting 2",
        real_time_portion: {
          qr_scans: [{
            code: "some_code"
          }]
        },
        async_portion: {
          videos: []
        },
        _id: "mno"
      })
      this.meetings.push({
        title: "Meeting 3",
        real_time_portion: {
          qr_scans: []
        },
        async_portion: {
          videos: [{
            video_url: "some_url"
          }]
        },
        _id: "pqr"
      })
    },
    setFakeStudents() {
      for(let i=0;i<26;i++) {  // 2-27 (a-z)
        let chr = String.fromCharCode(97 + i);
        this.students.push({
          first_name: "Student",
          last_name: chr,
          user_id: "student" + chr,
          email: "student"+chr+"@rpi.edu",
          password: "password",
        })
      }
      this.section1.students = this.section2.students
        = this.students
      this.section1.invited_students = this.students.slice(20)
      this.section1.pending_approval_students =
        this.students.slice(24)
      this.section2.pending_approval_students =
        this.students.slice(18)
        console.log("Pending", this.section1.pending_approval_students)
        console.log("Pending", this.section2.pending_approval_students)

    }
  },
}
</script>

<style scoped>
#course-info {
  margin-top: 3rem;
  /*border: blue solid;*/
  min-height: 47rem;
  padding-left: 5rem;
  padding-right: 5rem;
  padding-bottom: 2rem;
}

.course-info-container {
  height: 100%;
  display: inline-block;
  vertical-align: top;
}

#side-bar {
  /*border: black solid;*/
  /*width: 17rem;*/
  width: 18%;
}

#main {
  /*border: red solid;*/
  padding-top: 0.5rem;
  width: 78%;
}

#course-number {
  margin-top: 0;
}

.side-bar-link-container {
  margin-top: 1rem;
  margin-left: 0.75rem;
}

/*.side-bar-link-container:first-of-type {
  margin-top: 2rem;
}*/

.side-bar-link-wrapper {
  display: inline-block;
  cursor: pointer;
  -webkit-transition: color 0.1s linear;
  -ms-transition: color 0.1s linear;
  transition: color 0.1s linear;
}

.side-bar-link-wrapper:hover {
  color: #2c3e50;
}

.side-bar-link {
  display: inline-block;
  margin-left: 0.5rem;
}

.active-section {
  font-weight: bold;
  color: #2c3e50;
}

#meetings-section-header {
  /*border: blue solid;*/
  font-size: 1.5rem;
  margin-bottom: 2rem;
}
</style>