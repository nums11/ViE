<template>
  <div>
    <div class="spinner-border" role="status" v-if="!recording_has_loaded">
        <span class="sr-only">Loading...</span>
    </div>
    <video v-else id="video_player" class="video-js vjs-big-play-centered recording_video" data-setup='{"fluid": true}' controls>
      <source v-bind:src="recording.video_url" type="">
    </video>
  </div>
</template>

<script>
  import videojs from "video.js"
  import RecordingAPI from '@/services/RecordingAPI.js';
  import AsyncSubmissionAPI from '@/services/AsyncSubmissionAPI.js';

  export default {
    name: "WatchRecording",
    data() {
      return {
        recording: {},
        recording_has_loaded: false,
        submission: {}
      }
    },
    props: {

    },
    async created() {
      this.recording_id = this.$route.params.recording_id
      this.current_user = this.$store.state.user.current_user
      this.is_instructor = this.current_user.is_instructor
      await this.getRecording()
      if(!this.is_instructor){
        await this.createOrRetrieveStudentSubmission()
        if(this.submission.video_percent_watched < 100)
          this.preventSeekingAndPeriodicallyUpdateSubmission()
      }
    },
    computed: {
    },
    methods: {
      async getRecording() {
        const response = await RecordingAPI.getRecording(this.recording_id)
        this.recording = response.data
        this.recording_has_loaded = true
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
            is_recording: true,
            recording: this.recording
          }
          const response = await AsyncSubmissionAPI.addAsyncSubmission(async_submission)
          this.submission = response.data
        }
      },
      submissionExistsForStudent() {
        let submission_exists = false
        let student_submission = null
        for(let i=0; i < this.recording.recording_submissions.length; i++) {
          let submission = this.recording.recording_submissions[i]
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
            let current_time = 0 //set initial time to 0
            video.on("seeking", () => {
              if (current_time < video.currentTime())
                video.currentTime(current_time);
            });
            video.on("seeked", () => {
              if (current_time < video.currentTime())
                video.currentTime(current_time);
            });
            video.on('ended', () => {
              console.log("In ended")
              self.updateVideoSubmission(video.duration(), video.duration())
            });
            // Update the current time once a second
            setInterval(function() {
              if (!video.paused())
                current_time = video.currentTime();
            }, 1000);
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
.recording_video {
  width: 100%;
  height: 80%;
}
</style>