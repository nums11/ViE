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
        <div class="spinner-border" role="status" v-if="calculating_metrics">
          <span class="sr-only">Loading...</span>
        </div>
        <div class="metric-details" v-else>
          <p class="metric-value">{{ overall_percent }}%</p>
          <p class="metric-fraction">({{num_overall_meetings_attended}}/{{num_meetings}})</p>
        </div>
      </div>
      <div class="metric-container">
        <h3 class="metric-title">Live Attendance %</h3>
        <h4 class="metric-description">Percentage of meetings attend live</h4>
        <div class="spinner-border" role="status" v-if="calculating_metrics">
          <span class="sr-only">Loading...</span>
        </div>
        <div class="metric-details" v-else>
          <p class="metric-value">{{ live_percent }}%</p>
          <p class="metric-fraction">({{num_live_meetings_attended}}/{{num_live_meetings}})</p>
        </div>
      </div>
      <div class="metric-container">
        <h3 class="metric-title">Async Attendance %</h3>
        <h4 class="metric-description">Percentage of meetings attend asynchronously</h4>
        <div class="spinner-border" role="status" v-if="calculating_metrics">
          <span class="sr-only">Loading...</span>
        </div>
        <div class="metric-details" v-else>
          <p class="metric-value">{{ async_percent }}%</p>
          <p class="metric-fraction">({{num_async_meetings_attended}}/{{num_async_meetings}})</p>
        </div>
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
    },
    course: {
      type: Object,
      required: true
    }
  },
  components: {

  },
  data () {
    return {
      calculating_metrics: true,
      overall_percent: 0,
      live_percent: 0,
      async_percent: 0,
      num_meetings: 0,
      num_live_meetings_attended: 0,
      num_async_meetings_attended: 0,
      num_overall_meetings_attended: 0,
      num_live_meetings: 0,
      num_async_meetings: 0
    }
  },
  created () {
    console.log("Course", this.course)
    this.calculateMetrics()
    this.calculating_metrics = false
  },
  methods: {
    calculateMetrics() {
      this.num_meetings = this.course.meetings.length
      this.course.meetings.forEach(meeting => {
        if(meeting.has_real_time_portion)
          this.num_live_meetings++
        if(meeting.has_async_portion)
          this.num_async_meetings++
        let [submission_ids, async_submission_ids] = this.getMeetingSubmissionIDs(meeting)
        let attended = false
        if(submission_ids.has(this.student.user_id)) {
          this.num_live_meetings_attended++
          attended = true
        }
        if(async_submission_ids.has(this.student.user_id)) {
          this.num_async_meetings_attended++
          attended = true
        }
        if(attended)
          this.num_overall_meetings_attended++
      })
      if(this.num_meetings > 0)
        this.overall_percent = ((this.num_overall_meetings_attended / this.num_meetings) * 100).toFixed(1)
      if(this.num_live_meetings > 0)
        this.live_percent = ((this.num_live_meetings_attended / this.num_live_meetings) * 100).toFixed(1)
      if(this.num_async_meetings >0)
        this.async_percent = ((this.num_async_meetings_attended / this.num_async_meetings) * 100).toFixed(1)
    },
    getMeetingSubmissionIDs(meeting) {
      let submission_ids = new Set()
      meeting.real_time_portion.qr_scans.forEach(qr_scan =>{
        qr_scan.submissions.forEach(submission => {
          submission_ids.add(submission.submitter.user_id)
        })
      })
      let async_submission_ids = new Set()
      meeting.async_portion.videos.forEach(video =>{
        video.video_submissions.forEach(submission => {
          async_submission_ids.add(submission.submitter.user_id)
        })
      })
      return [submission_ids, async_submission_ids]
    }
  }
}
</script>

<style lang="css" scoped>
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

.metric-details {
  margin-top: 0;
}

.metric-value {
  text-align: center;
  font-size: 6rem;
  margin-bottom: 0;
}

.metric-fraction {
  top: 0;
  margin-top: 1rem;
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  color: #595757;
}
</style>