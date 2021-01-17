<template>
  <div id="course-info">
    <div v-if="!course_has_loaded">
      <sui-loader active size="large">
        Loading Course
      </sui-loader>
    </div>
    <div v-else>
      <SideBar :header="course.name"
      :sub_headers="[`${course.dept} ${course.course_number}`]"
      :links="links" :instructors="[course.instructor]"
      v-on:show-section="showSection" />
      <div class="course-info-container" id="main">
        <transition name="fade" mode="out-in">
          <div v-if="active_section === 'Meetings'" id="meetings-section"
          key="meetings">
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
            <CourseMeetingsForMonthContainer month="January"
            :meetings="meetings" />
          </div>
          <div v-else-if="active_section === 'Statistics'"
          id="roster-section" key="statistics">
            <h1>Coming Soon...</h1>
          </div>
          <div v-else-if="active_section === 'Roster'"
          id="roster-section" key="roster">
            <SectionInfoContainer v-for="section in course.sections"
            :key="section._id" :course="course" :section="section" />
          </div>
          <CourseSettingsContainer
          v-else-if="active_section === 'Settings'"
          :course="course"
          key="settings" />
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import CourseMeetingsForMonthContainer from
'@/components/CourseMeetingsForMonthContainer'
import SectionInfoContainer from
'@/components/SectionInfoContainer'
import CourseSettingsContainer from
'@/components/CourseSettingsContainer'
import SideBar from '@/components/SideBar'
import CourseAPI from '@/services/CourseAPI'

export default {
  name: 'CourseInfo',
  components: {
    CourseMeetingsForMonthContainer,
    SectionInfoContainer,
    CourseSettingsContainer,
    SideBar
  },
  data () {
    return {
      course: {},
      active_section: "Meetings",
      section_selector_options: [
        {
          text: "All Sections",
          value: 1
        }
      ],
      selected_section: null,
      links: [
        {
          link_name: "Meetings",
          icon_name: "users"
        },
        {
          link_name: "Statistics",
          icon_name: "chart bar"
        },
        {
          link_name: "Roster",
          icon_name: "user circle outline"
        },
        {
          link_name: "Settings",
          icon_name: "cog"
        }
      ],
      instructors: [
        {
          first_name: "John",
          last_name: "Doe"
        },
        {
          first_name: "Steven",
          last_name: "Smith"
        }
      ],
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
    this.setSectionSelectorOptions()
  },
  mounted () {
  },
  methods: {
    async getCourse() {
      try {
        const response = await CourseAPI.getCourseWithMeetings(
          this.$route.params.id)
        this.course = response.data
        this.getMeetingsForCourse()
        this.course_has_loaded = true
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong getting your course")
      }
    },
    getMeetingsForCourse() {
      this.course.sections.forEach(section => {
        this.meetings = this.meetings.concat(section.meetings)
      })
    },
    showSection(section_name) {
      this.active_section = section_name
    },
    setSectionSelectorOptions() {
      const sections = this.course.sections
      for(let i = 0; i < sections.length; i++) {
        this.section_selector_options.push({
          text: `Section ${sections[i].section_number}`,
          value: i + 2
        })
      }
    }
  }
}
</script>

<style scoped>
#course-info {
  margin-top: 3rem;
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
  width: 18%;
}

#main {
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
  font-size: 1.5rem;
  margin-bottom: 2rem;
}
</style>