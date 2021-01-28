<template>
  <div id="watch-video">
    <div v-if="!video_has_loaded">
      <sui-loader active size="large">
        Loading Video...
      </sui-loader>
    </div>
    <div v-else>
      <div id="header-container">
        <div>
          <h2 style="margin-left: 4rem;" class="inline-block ml-4">{{ video.name }}</h2>
<!--           <router-link id="back-to-course-btn"
          :to="{name: 'course_info', params: {id: course_id}}"> -->
            <sui-button content="Back to Meeting" icon="arrow left"
            label-position="left" class="inline-block float-right" />
          <!-- </router-link> -->
        </div>
        <div class="mt-1">
          <div class="inline-block sub-header-container center-text">
            Submission Window: 1/27 2pm - 2/4 4pm
          </div>
          <div class="inline-block sub-header-container center-text">
            50% watched
          </div>
          <div class="inline-block sub-header-container center-text">
            Unrestricted View
          </div>
        </div>
      </div>
      <div id="video-container">
        <video id="video_player"
        class="video-js vjs-big-play-centered "
        data-setup='{"fluid": true}' controls>
          <source v-bind:src="video.url">
        </video>
      </div>

    </div>
  </div>
</template>

<script>
import videojs from "video.js"
import AsyncPortionAPI from '@/services/AsyncPortionAPI.js'
import VideoAPI from '@/services/VideoAPI.js'
import SubmissionAPI from '@/services/SubmissionAPI.js'
import moment from 'moment'

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
    if(!this.is_instructor && this.isWithinAsyncPortionWindow()){
        await this.createOrRetrieveStudentSubmission()
        if(this.submission.video_percent_watched < 100)
          this.preventSeekingAndPeriodicallyUpdateSubmission()
    }
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
        window.alert("Sorry, something went wrong.")
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
    isWithinAsyncPortionWindow() {
      const current_time = new Date()
      return moment(current_time).isSameOrAfter(
        this.async_portion.async_start) &&
        moment(current_time).isBefore(this.async_portion.async_end)
    },
    async createOrRetrieveStudentSubmission() {
      const [submission_exists, submission]
        = this.submissionExistsForStudent()
      if(submission_exists) {
        this.submission = submission
      } else {
        const submission = {
          submitter: this.state_user._id,
          task_type: "Video",
          furthest_video_time: 0,
          video_percent_watched: 0
        }
        try {
          const response = await
            VideoAPI.addVideoSubmission(this.video._id,submission)
          this.submission = response.data
        } catch(error) {
          console.log(error)
          window.alert("Sorry, something went wrong")
        }
      }
    },
    submissionExistsForStudent() {
      let submission_exists = false
      let student_submission = null
      for(let i=0; i < this.video.submissions.length; i++) {
        const submission = this.video.submissions[i]
        if(submission.submitter.user_id === this.state_user.user_id) {
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
      this.submission.video_percent_watched
        = (current_time / video_duration) * 100
      try {
        const response = await SubmissionAPI.updateSubmission(
          this.submission._id, this.submission)
        this.submission = response.data
      } catch(error) {
        console.log(error)
        window.alert("Sorry, something went wrong")
      }
    }
  }
};
</script>

<style scoped>
#watch-video {
  padding-left: 8rem;
  padding-right: 8rem;
  padding-top: 2rem;
}

#header-container {
  margin-bottom: 1rem;
}

.sub-header-container {
  width: 33.3%;
}

#video-container {
  width: 90%;
  margin: auto;
  height: 40rem;
}

#video_player {
  width: 100%;
  height: 100%;
  /*width: 10%;*/
  /*width: 40rem;*/
  /*height: 10rem;*/
  /*width: 80%;*/
}

/*.video_video {
  width: 100%;
  height: 80%;
}*/
</style>