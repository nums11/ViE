<template>
  <div id="mobile-meeting-info" class="center-text">
    <h1 class="wrap-text">{{ meeting.title }}</h1>
    <h3 class="wrap-text">
      {{ meeting_course.name }}
    </h3>
    <h4 class="wrap-text">
      {{ meeting_course.dept }}
      {{ meeting_course.course_number }}
      Section
      <span v-if="meeting.sections.length > 1">s</span>
      <span v-for="(section,index) in meeting.sections">
        {{ section.section_number }}
        <span v-if="index !== meeting.sections.length-1">,</span>
      </span>
    </h4>
    <div class="mt-2">
      <sui-icon name="graduation cap" />
      <p v-for="(instructor,index) in meeting_course.instructors"
      class="inline-block" id="instructor-name">
        {{ instructor.first_name }}
        {{ instructor.last_name }}<span v-if="
        index !== meeting_course.instructors.length-1">,
        </span>
      </p>
    </div>
    <MobileMeetingInfoPortionContainer
    :portion="meeting.real_time_portion"
    :meeting_id="meeting._id"
    is_real_time />
    <MobileMeetingInfoPortionContainer
    :portion="meeting.async_portion"
    :meeting_id="meeting._id" />
  </div>
</template>

<script>
import MobileMeetingInfoPortionContainer from
'@/components/MobileMeetingInfoPortionContainer'

export default {
  name: 'MobileMeetingInfo',
  props: {
    meeting: {
      type: Object,
      required: true
    },
    meeting_course: {
      type: Object,
      required: true
    },
  },
  components: {
    MobileMeetingInfoPortionContainer
  },
  data() {
    return {
    }
  },
  mounted() {
  },
  methods: {
  }
}
</script>

<style scoped>
#mobile-meeting-info {
  width: 95%;
  margin: auto;
  margin-top: 1rem;
}

#instructor-name {
  margin-left: 0.5rem;
}
</style>