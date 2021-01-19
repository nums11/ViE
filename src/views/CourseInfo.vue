<template>
  <div id="course-info">
    <div v-if="!course_has_loaded">
      <sui-loader active size="large">
        Loading Course
      </sui-loader>
    </div>
    <div v-else>
      <hide-at breakpoint="small">
        <DesktopCourseInfo :course="course" :links="links"
        :section_selector_options="section_selector_options"
        :meetings="meetings" />
      </hide-at>
      <show-at breakpoint="small">
        <MobileCourseInfo :course="course" :links="links"
        :section_selector_options="section_selector_options"
        :meetings="meetings" />
      </show-at>
    </div>
  </div>
</template>

<script>
import DesktopCourseInfo from
'@/components/DesktopCourseInfo'
import MobileCourseInfo from
'@/components/MobileCourseInfo'
import CourseAPI from '@/services/CourseAPI'
import helpers from '@/helpers.js'

export default {
  name: 'CourseInfo',
  mixins: [helpers],
  components: {
    DesktopCourseInfo,
    MobileCourseInfo
  },
  data () {
    return {
      course: {},
      section_selector_options: [
        {
          text: "All Sections",
          value: 1
        }
      ],
      links: [
        {
          link_name: "Meetings",
          icon_name: "users"
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
    if(this.is_instructor)
      this.addSideBarLinks()
    await this.getCourse()
    this.setSectionSelectorOptions()
  },
  mounted () {
  },
  methods: {
    addSideBarLinks() {
      this.links.push({
        link_name: "Statistics",
        icon_name: "chart bar"
      })
      this.links.push({
        link_name: "Roster",
        icon_name: "user circle outline"
      })
      this.links.push({
        link_name: "Settings",
        icon_name: "cog"
      })
    },
    async getCourse() {
      try {
        const response = await CourseAPI.getCourseWithMeetings(
          this.$route.params.id)
        this.course = response.data
        this.course.sections.sort(this.sectionCompare)
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
  padding-bottom: 2rem;
}
</style>