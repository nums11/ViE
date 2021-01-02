<template>
  <div>
    <h2>Edit Video</h2>
    <div class="spinner-border" role="status" v-if="!video_has_loaded">
      <span class="sr-only">Loading...</span>
    </div>
    <div v-else>
      <form @submit.prevent="updateVideo">
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label>Video URL: </label>
              <input type="text" class="form-control" v-model="video.video_url" disabled>
            </div>
          </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label>Start</label>
                <input class="datetime-picker" placeholder="Select date & time"
                id="video-submission-start"
                v-model="video.video_submission_start_time"
                type="datetime-local"/>
                <label>End</label>
                <input class="datetime-picker" placeholder="Select date & time"
                id="video-submission-start"
                v-model="video.video_submission_end_time"
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
          <h3 style="text-decoration:underline; margin-top:2rem; font-weight:bold;">Video Submissions</h3>
          <div v-for="submission in video.video_submissions">
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
  import VideoAPI from '@/services/VideoAPI.js';

  export default {
    name: 'AdminEditVideo',
    components: {
    },
    data() {
      return {
        video: {},
        video_has_loaded: false,
      }
    },
    created() {
      this.video_id = this.$route.params.video_id
      this.getVideo()
    },
    methods: {
      async getVideo() {
        const response = await VideoAPI.getVideo(this.video_id)
        this.video = response.data
        console.log("Got video", this.video)
        this.video_has_loaded = true
      },
      async updateVideo() {
        let confirmation = confirm("Are you sure you want to update this video?")
        if(confirmation){
          let updated_video = {
            video_submission_start_time: new Date(this.video.video_submission_start_time),
            video_submission_end_time: new Date(this.video.video_submission_end_time),
          }
          const response = await VideoAPI.updateVideo(this.video_id, updated_video)
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