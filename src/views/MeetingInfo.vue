<template>
  <div>
    <div class="spinner-border" role="status" v-if="!meeting_has_loaded">
        <span class="sr-only">Loading...</span>
    </div>
    <div v-else>
      <h1>{{ meeting.title }}</h1>
      <h2 v-if="for_course">{{ meeting.course.name }}</h2>
      <h2 v-else>{{ meeting.org.name }}</h2>
      <h3 v-if="meeting.has_live_attendance">Has Live Attendance</h3>
      <h3 v-else>No Live Attendance</h3>
      <h3 v-if="meeting.has_async_attendance">Has Async Attendance</h3>
      <h3 v-else>No Async Attendance</h3>

      <h2 style="margin-top:5rem; text-decoration:underline;">Live Attendance</h2>
      <h3 style="text-decoration:underline;">QR Checkins</h3>
      <div v-for="qr_checkin in meeting.live_attendance.qr_checkins">
        <h4>code: {{ qr_checkin.code }}</h4>
        <h4>start time: {{ new Date(qr_checkin.qr_checkin_start_time) }}</h4>
        <h4>end time: {{ new Date(qr_checkin.qr_checkin_end_time) }}</h4>
        <h4 style="text-decoration:underline;">Submissions</h4>
        <h4 v-for="submission in qr_checkin.qr_checkin_submissions">
          <p>{{ submission.submitter.first_name }}</p>
          <p>{{ submission.submitter.last_name }}</p>
          <p>{{ submission.submitter.user_id }}</p>
        </h4>
      </div>
      <h3 style="text-decoration:underline;">Live Polls</h3>

      <h2 style="margin-top:5rem; text-decoration:underline;">Async Attendance</h2>
      <h3>Recordings</h3>
    </div>
  </div>
</template>

<script>
  import MeetingAPI from '@/services/MeetingAPI.js';

  export default {
    name: 'MeetingInfo',
    components: {

    },
    data(){
      return {
        meeting: {},
        meeting_has_loaded: false,
        for_course: Boolean
      }
    },
    created() {
      this.getMeeting()
    },
    methods: {
      async getMeeting() {
        this.meeting_id = this.$route.params.meeting_id
        const response = await MeetingAPI.getMeeting(this.meeting_id)
        this.meeting = response.data
        this.for_course = this.meeting.for_course
        this.meeting_has_loaded = true
      }
    }
  }
</script>

<style scoped>

</style>