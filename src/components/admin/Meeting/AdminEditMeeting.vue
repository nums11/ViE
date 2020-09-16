<template>
  <div>
    <h2>Edit Meeting</h2>
    <router-link :to="{name: 'meeting_info', params: { id: meeting._id }}" tabindex="-1">
      <button class="inline-block"tabindex="0">Go to Meeting Info for  {{ meeting.title }}</button>
    </router-link>
    <div class="spinner-border" role="status" v-if="!meeting_has_loaded">
      <span class="sr-only">Loading...</span>
    </div>
    <div v-else>
      <form @submit.prevent="updateMeeting">
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label>Name</label>
              <input type="text" class="form-control" v-model="meeting.title">
            </div>
          </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label>For Course</label>
                <input class="form-control" v-model="meeting.for_course" rows="5" disabled>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group" v-if="meeting.for_course">
                <label>Course</label>
                <input type="text" class="form-control" v-model="meeting.course.name" rows="5" disabled>
              </div>
              <div v-else class="form-group" v-else>
                <label>Org</label>
                <input type="text" class="form-control" v-model="meeting.org.name" rows="5" disabled>
              </div>
            </div>
          </div><br />
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label>has_live_attendance</label>
                  <input type="checkbox" class="form-control" v-model="meeting.has_live_attendance" rows="5" disabled>
              </div>
              <div class="form-group">
                <label>has_async_attendance</label>
                  <input type="checkbox" class="form-control" v-model="meeting.has_async_attendance" rows="5" disabled>
              </div>
            </div>
          </div>
          <div class="form-group">
            <button class="btn btn-primary">Update</button>
          </div>
      </form>

      <div class="container">
        <div v-if="meeting.live_attendance != null">
          <h3 style="text-decoration:underline; margin-top:2rem; font-weight:bold;">Live Attendance</h3>
          <div class="attendance-container" v-for="qr_checkin in meeting.live_attendance.qr_checkins">
            <h4>Start Time: {{ new Date(qr_checkin.qr_checkin_start_time) }}</h4>
            <h4>End Time: {{ new Date(qr_checkin.qr_checkin_end_time) }}</h4>
            <h4>Code: {{ qr_checkin.code }}</h4>
          </div>
        </div>
        <div class="attendance-container" v-if="meeting.async_attendance != null">
          <h3 style="text-decoration:underline; margin-top:2rem; font-weight:bold;">Async Attendance</h3>
          <div v-for="recording in meeting.async_attendance.recordings">
            <h4>Start Time: {{ new Date(recording.recording_submission_start_time) }}</h4>
            <h4>End Time: {{ new Date(recording.recording_submission_end_time) }}</h4>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import MeetingAPI from '@/services/MeetingAPI.js';

  export default {
    name: 'AdminEditMeeting',
    components: {
    },
    data() {
      return {
        meeting: {},
        meeting_has_loaded: false,
      }
    },
    created() {
      this.meeting_id = this.$route.params.meeting_id
      this.getMeeting()
    },
    methods: {
      async getMeeting() {
        const response = await MeetingAPI.getMeeting(this.meeting_id)
        this.meeting = response.data
        console.log("Got meeting", this.meeting)
        this.meeting_has_loaded = true
      },
      async updateMeeting() {
        // const response = await MeetingAPI.updateMeeting(this.meeting_id, this.meeting)
        // this.$router.go()
      }, 
    }
  }
</script>

<style scoped>
.attendance-container {
  border: black solid;
  margin-top: 2rem;
  width: 50rem;
}
</style>