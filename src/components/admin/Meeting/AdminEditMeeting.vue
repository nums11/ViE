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
              <div v-else class="form-group">
                <label>Org</label>
                <input type="text" class="form-control" v-model="meeting.org.name" rows="5" disabled>
              </div>
            </div>
          </div><br />
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label>has_real_time_portion</label>
                  <input type="checkbox" class="form-control" v-model="meeting.has_real_time_portion" rows="5" disabled>
              </div>
              <div class="form-group">
                <label>has_async_portion</label>
                  <input type="checkbox" class="form-control" v-model="meeting.has_async_portion" rows="5" disabled>
              </div>
            </div>
          </div>
          <div v-if="meeting.has_real_time_portion" class="row">
            <p>Start: {{ new Date(meeting.start_time) }}</p>
            <p>End: {{ new Date(meeting.end_time) }}</p>
            <div class="col-md-6">
              <div class="form-group">
                <label>Start</label>
                <input class="datetime-picker" placeholder="Select date & time"
                id="qr_scan-submission-start"
                v-model="meeting.start_time"
                type="datetime-local"/>
                <label>End</label>
                <input class="datetime-picker" placeholder="Select date & time"
                id="qr_scan-submission-start"
                v-model="meeting.end_time"
                type="datetime-local"/>
              </div>
            </div>
          </div><br />
          <div class="form-group">
            <button class="btn btn-primary">Update</button>
          </div>
      </form>

      <div class="container">
        <div v-if="meeting.real_time_portion != null">
          <h3 style="text-decoration:underline; margin-top:2rem; font-weight:bold;">Live Attendance</h3>
          <div class="attendance-container" v-for="qr_scan in meeting.real_time_portion.qr_scans">
            <h4>Start Time: {{ new Date(qr_scan.qr_scan_start_time) }}</h4>
            <h4>End Time: {{ new Date(qr_scan.qr_scan_end_time) }}</h4>
            <h4>Code: {{ qr_scan.code }}</h4>
            <router-link :to="{name: 'admin_edit_qr_scan', params: { qr_scan_id: qr_scan._id }}" class="btn btn-primary">Edit</router-link>
          </div>
        </div>
        <div class="attendance-container" v-if="meeting.async_portion != null">
          <h3 style="text-decoration:underline; margin-top:2rem; font-weight:bold;">Async Attendance</h3>
          <div v-for="video in meeting.async_portion.videos">
            <h4>Start Time: {{ new Date(video.video_submission_start_time) }}</h4>
            <h4>End Time: {{ new Date(video.video_submission_end_time) }}</h4>
            <router-link :to="{name: 'admin_edit_video', params: { video_id: video._id }}" class="btn btn-primary">Edit</router-link>
            <button class="btn btn-danger" @click.prevent="removeVideoFromMeeting(video._id)">Delete</button>
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
        let confirmation = confirm("Are you sure you want to update this meeting?")
        if(confirmation){
          let updated_meeting = {
            title: this.meeting.title,
            start_time: new Date(this.meeting.start_time),
            end_time: new Date(this.meeting.end_time),
          }
          const response = await MeetingAPI.updateMeeting(this.meeting_id, updated_meeting)
          this.$router.go()
        }
      },
      async removeVideoFromMeeting(video_id) {
        let confirmation = confirm("Are you sure you want to remove this video?")
        if(confirmation){
          await MeetingAPI.removeVideoFromMeeting(this.meeting_id,
            this.meeting.async_portion._id, video_id)
          this.$router.go()
        }
      }
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