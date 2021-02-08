<template>
  <div id="mobile-course-info" class="center-text">
    <h1 class="wrap-text">{{ course.name }}</h1>
    <h3 class="wrap-text">
      {{ course.dept }}
      {{ course.course_number }}
    </h3>
    <div class="mt-2">
      <sui-icon name="graduation cap" />
      <p v-for="(instructor,index) in course.instructors"
      class="inline-block" id="instructor-name">
        {{ instructor.first_name }}
        {{ instructor.last_name }}<span v-if="
        index !== course.instructors.length-1">,
        </span>
      </p>
    </div>
    <div class="mt-3" id="meetings-header">Meetings</div>
    <CourseMeetingsCalendar :meetings="meetings" />
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
    CourseMeetingsCalendar
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
  width: 95%;
  margin: auto;
  margin-top: 1rem;
}

#instructor-name {
  margin-left: 0.5rem;
}

#meetings-header {
  font-size: 2rem;
}
</style>