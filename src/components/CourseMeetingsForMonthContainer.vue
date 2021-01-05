<template>
  <div class="course-meetings-for-month-container">
    <div class="month">{{ month }}</div>
    <div class="meeting-cards">
      <CourseMeetingCard v-for="(meeting,index) in meetings"
      :key="meeting._id" :meeting="meeting" />
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
</style>