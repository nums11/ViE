<template>
  <div id="mobile-course-info" class="center-text">
    <h1 class="wrap-text">{{ course.name }}</h1>
    <h3 class="wrap-text">
      {{ course.dept }}
      {{ course.course_number }}
    </h3>
    <div class="mt-2">
      <sui-icon name="graduation cap" />
      <p class="inline-block" id="instructor-name">
        {{ course.instructor.first_name }}
        {{ course.instructor.last_name }}
      </p>
    </div>
    <div class="mt-3" id="meetings-header">Meetings</div>
    <CourseMeetingsForMonthContainer month="January"
      :meetings="meetings" />
  </div>
</template>

<script>
import SideBar from '@/components/SideBar'
import CourseMeetingsForMonthContainer from
'@/components/CourseMeetingsForMonthContainer'
import SectionInfoContainer from
'@/components/SectionInfoContainer'
import CourseSettingsContainer from
'@/components/CourseSettingsContainer'
import CourseAPI from '@/services/CourseAPI'
import helpers from '@/helpers.js'

export default {
  name: 'MobileCourseInfo',
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
    CourseMeetingsForMonthContainer
  },
  data () {
    return {

    }
  },
  async created () {

  },
  mounted () {
  },
  methods: {

  }
}
</script>

<style scoped>
#mobile-course-info {
  /*border: green solid;*/
  width: 100%;
}

#instructor-name {
  margin-left: 0.5rem;
}

#meetings-header {
  font-size: 2rem;
}
</style>