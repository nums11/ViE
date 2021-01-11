<template>
  <div>
    <div v-if="!video_has_loaded">
      <sui-loader active />
    </div>
    <video v-else id="video_player"
    class="video-js vjs-big-play-centered video_video"
    data-setup='{"fluid": true}' controls>
      <source v-bind:src="video.url">
    </video>
  </div>
</template>

<script>
import videojs from "video.js"
import AsyncPortionAPI from '@/services/AsyncPortionAPI.js';
// import AsyncSubmissionAPI from '@/services/AsyncSubmissionAPI.js';

export default {
  name: "WatchVideo",
  data() {
    return {
      video: {},
      video_has_loaded: false,
      submission: {}
    }
  },
  props: {

  },
  async created() {
    this.video_id = this.$route.params.video_id
    await this.getAsyncPortion()
    // if(!this.is_instructor && this.getWindowStatus(this.video, false) === "open"){
    //     await this.createOrRetrieveStudentSubmission()
    //     if(this.submission.video_percent_watched < 100)
    //       this.preventSeekingAndPeriodicallyUpdateSubmission()
    // }
  },
  computed: {
  },
  methods: {
    async getAsyncPortion() {
      try {
        const async_portion_id = this.$route.params.async_portion_id
        const response = await AsyncPortionAPI.getAsyncPortion(
          async_portion_id)
        this.async_portion = response.data
        console.log("async_portion", this.async_portion)
        this.getVideo()
        this.video_has_loaded = true
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong.")
      }
    },
    getVideo() {
      const video_id = this.$route.params.video_id
      const videos = this.async_portion.videos
      for(let i = 0; i < videos.length; i++) {
        const video = videos[i]
        if(video._id === video_id) {
          this.video = video
          break
        }
      }
    },
    getWindowStatus(attendance, is_qr) {
      let current_time = new Date()
      let window_start = null
      let window_end = null
      if(is_qr) {
        window_start = new Date(attendance.qr_scan_start_time)
        window_end = new Date(attendance.qr_scan_end_time)
      } else {
        window_start = new Date(attendance.video_submission_start_time)
        window_end = new Date(attendance.video_submission_end_time)
      }
      let window_status = ""
      if(current_time > window_end)
        window_status = "closed"
      else if(current_time < window_start)
        window_status = "upcoming"
      else
        window_status = "open"
      return window_status
    },
    async createOrRetrieveStudentSubmission() {
      let student_submission_status = this.submissionExistsForStudent()
      let submission_exists = student_submission_status[0]
      let submission = student_submission_status[1]
      if(submission_exists) {
        this.submission = submission
      } else {
        let async_submission = {
          submitter: this.$store.state.user.current_user,
          is_video: true,
          video: this.video
        }
        const response = await AsyncSubmissionAPI.addAsyncSubmission(async_submission)
        this.submission = response.data
      }
    },
    submissionExistsForStudent() {
      let submission_exists = false
      let student_submission = null
      for(let i=0; i < this.video.video_submissions.length; i++) {
        let submission = this.video.video_submissions[i]
        if(submission.submitter.user_id === this.current_user.user_id) {
          student_submission = submission
          submission_exists = true
          break
        }
      }
      return [submission_exists, student_submission]
    },
    preventSeekingAndPeriodicallyUpdateSubmission() {
      let self = this
      this.$nextTick(() => {
        videojs("video_player").ready(function() {
          let video = this
          let current_time = 0
          // start the video at a different time if user has watched
          if(self.submission.furthest_video_time > 0){
            current_time = self.submission.furthest_video_time
            video.currentTime(current_time)
          }
          console.log("video current time", video.currentTime())

          video.on("seeking", () => {
            if (current_time < video.currentTime() ||
              current_time < self.submission.furthest_video_time){
              video.currentTime(current_time);
            }
          });
          video.on("seeked", () => {
            if (current_time < video.currentTime() ||
              current_time < self.submission.furthest_video_time){
              video.currentTime(current_time);
            }
          });
          video.on('ended', () => {
            console.log("In ended")
            self.updateVideoSubmission(video.duration(), video.duration())
          });
          // Update the current time once every half second
          setInterval(function() {
            if (!video.paused())
              current_time = video.currentTime();
          }, 500);
          // Update user's submission every 5 seconds
          setInterval(async function() {
            if(current_time > self.submission.furthest_video_time)
              self.updateVideoSubmission(current_time, video.duration())
          }, 5000);
        })
      })
    },
    async updateVideoSubmission(current_time, video_duration) {
      this.submission.furthest_video_time = current_time
      this.submission.video_percent_watched = (current_time / video_duration) * 100
      const response = await AsyncSubmissionAPI.updateAsyncSubmission(this.submission._id, this.submission)
      this.submission = response.data
    }
  }
};
</script>

<style scoped>
.video_video {
  width: 100%;
  height: 80%;
}
</style>