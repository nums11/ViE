<template>
  <div id="desktop-course-info">
    <SideBar :header="course.name"
    :sub_headers="[`${course.dept} ${course.course_number}`]"
    :links="links" :instructors="course.instructors"
    v-on:show-section="showSection" />
    <div class="course-info-container" id="main">
      <transition name="fade" mode="out-in">
        <div v-if="active_section === 'Meetings'" id="meetings-section"
        key="meetings">
          <div id="meetings-section-header-container">
            <div id="meetings-section-header">Meetings</div>
            <div v-if="is_instructor">
              <sui-dropdown selection
              placeholder="All sections"
              :options="section_selector_options"
              v-model="selected_section" disabled />
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
          <CourseMeetingsCalendar :meetings="meetings" />
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
</template>

<script>
import SideBar from '@/components/SideBar'
import CourseMeetingsCalendar from
'@/components/CourseMeetingsCalendar'
import SectionInfoContainer from
'@/components/SectionInfoContainer'
import CourseSettingsContainer from
'@/components/CourseSettingsContainer'
import CourseAPI from '@/services/CourseAPI'
import helpers from '@/helpers.js'

export default {
  name: 'DesktopCourseInfo',
  mixins: [helpers],
  props: {
    course: {
      type: Object,
      required: true
    },
    links: {
      type: Array,
      required: true
    },
    section_selector_options: {
      type: Array,
      required: true
    },
    selected_section: null,
    meetings: {
      type: Array,
      required: true
    }
  },
  components: {
    SideBar,
    CourseMeetingsCalendar,
    SectionInfoContainer,
    CourseSettingsContainer

  },
  data () {
    return {
      active_section: "Meetings",

    }
  },
  created () {
  },
  mounted () {
  },
  methods: {
    showSection(section_name) {
      this.active_section = section_name
    },
  }
}
</script>

<style scoped>
#desktop-course-info {
  padding-left: 5rem;
  padding-right: 5rem;
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

#meetings-section-header {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}
</style>