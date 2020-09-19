<template>
  <div>
    <h2>Edit Recording</h2>
    <div class="spinner-border" role="status" v-if="!recording_has_loaded">
      <span class="sr-only">Loading...</span>
    </div>
    <div v-else>
      <form @submit.prevent="updateRecording">
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label>Video URL: </label>
              <input type="text" class="form-control" v-model="recording.video_url" disabled>
            </div>
          </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label>Start</label>
                <input class="datetime-picker" placeholder="Select date & time"
                id="recording-submission-start"
                v-model="recording.recording_submission_start_time"
                type="datetime-local"/>
                <label>End</label>
                <input class="datetime-picker" placeholder="Select date & time"
                id="recording-submission-start"
                v-model="recording.recording_submission_end_time"
                type="datetime-local"/>
              </div>
            </div>
          </div><br />
          <div class="form-group">
            <button class="btn btn-primary">Update</button>
          </div>
      </form>

      <div class="container">
        <div class="attendance-container">
          <h3 style="text-decoration:underline; margin-top:2rem; font-weight:bold;">Recording Submissions</h3>
          <div v-for="submission in recording.recording_submissions">
            <h4>First Name: {{ submission.submitter.first_name }}</h4>
            <h4>Last Name: {{ submission.submitter.last_name }}</h4>
            <h4>User ID: {{ submission.submitter.user_id }}</h4>
            <h4>Video Percent Watched: {{ submission.video_percent_watched }}</h4>
            <h4>Furthest video time: {{ submission.furthest_video_time }}</h4>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import RecordingAPI from '@/services/RecordingAPI.js';

  export default {
    name: 'AdminEditRecording',
    components: {
    },
    data() {
      return {
        recording: {},
        recording_has_loaded: false,
      }
    },
    created() {
      this.recording_id = this.$route.params.recording_id
      this.getRecording()
    },
    methods: {
      async getRecording() {
        const response = await RecordingAPI.getRecording(this.recording_id)
        this.recording = response.data
        console.log("Got recording", this.recording)
        this.recording_has_loaded = true
      },
      async updateRecording() {
        let confirmation = confirm("Are you sure you want to update this recording?")
        if(confirmation){
          const response = await RecordingAPI.updateRecording(this.recording_id, this.recording)
          this.$router.go()
        }
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