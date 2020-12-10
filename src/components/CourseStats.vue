<template>
  <div class="course-stats">
    <div class="metrics">
      <div class="metric-container">
        <h4 class="metric-title">Overall Attendance %:</h4>
        <h5 class="metric-description">Percentage of meetings attend either live or asynchronously</h5>
      </div>
      <div class="metric-container">
        <h4 class="metric-title">Live Attendance %:</h4>
        <h5 class="metric-description">Percentage of meetings attend live</h5>
      </div>
      <div class="metric-container">
        <h4 class="metric-title">Async Attendance %:</h4>
        <h5 class="metric-description">Percentage of meetings attend asynchronously</h5>
      </div>
    </div>

    <SectionStats v-for="section in course.sections" :key="section._id"
    :section="section" />
  </div>
</template>

<script>
import SectionStats from '@/components/SectionStats'

export default {
  name: 'CourseStats',
  props: {
    course: {
      type: Object,
      required: true
    },
  },
  components: {
    SectionStats
  },
  data () {
    return {
    }
  },
  created () {
    console.log("Course", this.course)
  },
  methods: {
  }
}
</script>

<style lang="css" scoped>
.metrics {
  /*border: blue solid;*/
  margin-top: 1rem;
}

.metric-container {
  padding: 0;
}

.metric-title {
  display: inline-block;
  margin-top: 0;
}

.metric-description {
  display: inline-block;
  margin-left: 0.5rem;
  color: #595757;
  margin-top: 0;
}
</style>