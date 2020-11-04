<template>
  <div class="student-stats">
    <sui-button 
      compact icon="left arrow" 
      label-position="left" 
      @click="$emit('show-student-list')"
      content="Back" />
    <h1>{{ student.first_name }} {{ student.last_name }} ({{ student.user_id }})</h1>
    <div class="metrics-container">
      <div class="metric-container">
        <h3 class="metric-title">Overall Attendance %</h3>
        <h4 class="metric-description">Percentage of meetings attend either live or asynchrnously</h4>
        <p class="metric-value">87%</p>
      </div>
      <div class="metric-container">
        <h3 class="metric-title">Live Attendance %</h3>
        <h4 class="metric-description">Percentage of meetings attend live</h4>
        <p class="metric-value">87%</p>
      </div>
      <div class="metric-container">
        <h3 class="metric-title">Async Attendance %</h3>
        <h4 class="metric-description">Percentage of meetings attend asynchronously</h4>
        <p class="metric-value">87%</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StudentStats',
  props: {
    student: {
      type: Object,
      required: true
    }
  },
  components: {

  },
  data () {
    return {

    }
  },
  created () {

  },
  methods: {

  }
}
</script>

<style lang="scss" scoped>
.metrics-container {
  margin-top: 2rem;
  height: 32rem;
}

.metric-container {
  width: 33%;
  height: 100%;
  display: inline-block;
  vertical-align: top;
}

.metric-title {
  margin-top: 0.5rem;
  text-align: center;
}

.metric-description {
  margin-top: 0;
  text-align: center;
  font-weight: bold;
  color: #595757;
  height: 10%;
}

.metric-value {
  margin-top: 4rem;
  text-align: center;
  font-size: 7rem;
}
</style>