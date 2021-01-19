<template>
  <div class="course-meetings-for-month-container">
    <div class="month">{{ month }}</div>
    <div class="meeting-cards">
      <p v-if="meetings.length === 0" class="no-meetings-text">
        No Meetings.
        <span v-if="is_instructor">Click the green
        button above to schedule your first meeting.</span>
      </p>
      <div v-else>
        <CourseMeetingCard v-for="(meeting,index) in meetings"
        :meeting="meeting" />
      </div>
    </div>
  </div>
</template>

<script>
import CourseMeetingCard from '@/components/CourseMeetingCard'

export default {
  name: 'CourseMeetingsForMonthContainer',
  props: {
    month: {
      type: String,
      required: true
    },
    meetings: {
      type: Array,
      required: true
    }
  },
  components: {
    CourseMeetingCard
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

  },
}
</script>

<style scoped>
.course-meetings-for-month-container {
  margin-top: 3rem;
}

.month {
  font-size: 1.5rem;
}

.meeting-cards {
  width: 97%;
  margin: auto;
}

.no-meetings-text {
  margin-top: 3rem;
  text-align: center;
}
</style>