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
          <h2 class="wrap-text" id="video-name">{{ video.name }}</h2>
          <hide-at breakpoint="small">
            <router-link
            :to="{name: 'meeting_info', params: {meeting_id: meeting_id}}">
              <sui-button content="Back to Meeting" icon="arrow left"
              label-position="left" class="inline-block float-right" />
            </router-link>
          </hide-at>
        </div>
        <div class="mt-1">
          <div class="inline-block sub-header-container center-text">
            Submission Window:
            {{ async_portion.async_start | moment("M/D h:mm a") }} -
            {{ async_portion.async_end | moment("M/D h:mm a") }}
          </div>
          <div class="inline-block sub-header-container center-text">
            <span v-if="view_mode === 'Restricted Mode'">
              {{ this.submission.video_percent_watched.toFixed(2) }}% watched
            </span>
          </div>
          <div class="inline-block sub-header-container center-text">
            {{ view_mode }}
            <sui-popup :content="popup_content" position="top center"
            inverted>
              <sui-icon slot="trigger" name="info circle" />
            </sui-popup>
          </div>
        </div>
      </div>
      <div id="video-container">
        <video id="video_player"
        class="video-js vjs-big-play-centered "
        :data-setup="JSON.stringify(data_setup)" controls>
          <source v-bind:src="video.url">
        </video>
      </div>
      <show-at breakpoint="small">
        <div id="back-to-meeting-btn">
          <router-link
          :to="{name: 'meeting_info', params: {meeting_id: meeting_id}}">
            <sui-button content="Back to Meeting" icon="arrow left"
            label-position="left" style="margin:auto;" />
          </router-link>
        </div>
      </show-at>
    </div>
  </div>
</template>

<script>
import videojs from "video.js"
import AsyncPortionAPI from '@/services/AsyncPortionAPI.js'
import VideoAPI from '@/services/VideoAPI.js'
import SubmissionAPI from '@/services/SubmissionAPI.js'
import MeetingAPI from '@/services/MeetingAPI.js'
import moment from 'moment'
import helpers from '@/helpers.js'

export default {
  name: "WatchVideo",
  mixins: [helpers],
  data() {
    return {
      video: {},
      video_has_loaded: false,
      submission: {},
      meeting_id: "",
      view_mode: "",
      popup_content: "",
      data_setup: {
        "fluid": true,
        "playbackRates": [0.5,1]
      }
    }
  },
  props: {

  },
  async created() {
    this.meeting_id = this.$route.params.meeting_id
    this.video_id = this.$route.params.video_id
    try {
      await this.getAsyncPortion()
      console.log("value", this.video.allow_unrestricted_viewing_for_real_time_submitters)
      if(!this.is_instructor && this.isWithinAsyncPortionWindow()){
        if(this.video.allow_unrestricted_viewing_for_real_time_submitters) {
          console.log(" allow Unrestricted")
          const response = await MeetingAPI.getMeeting(this.meeting_id)
          const meeting = response.data
          const student_submitted_to_any_qr =
            this.checkIfStudentSubmittedToAnyQR(meeting)
          console.log("student_submitted_to_any_qr", student_submitted_to_any_qr)
          if(student_submitted_to_any_qr)
            this.setViewMode(false)
          else
            this.checkToRestrictStudent()
        } else {
          console.log("No allowing Unrestricted")
          this.checkToRestrictStudent()
        }
      } else {
        this.setViewMode(false)
      }
      if(this.view_mode === 'Unrestricted Mode')
        this.allowFasterVideoViewing()
      this.video_has_loaded = true
    } catch(error) {
      console.log(error)
      alert("Sorry, something went wrong")
    }
  },
  beforeDestroy() {
    // Deletes player so that if user returns to this page
    // restricted playback still works. videojs .dispose
    // function was broken
    if(this.player != null) {
      console.log()
      delete videojs.getPlayers().video_player
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
        this.getVideo()
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
    checkIfStudentSubmittedToAnyQR(meeting) {
      if(meeting.real_time_portion == null)
        return false

      let student_submitted_to_any_qr = false
      const qr_scans = meeting.real_time_portion.qr_scans
      for(let i = 0; i < qr_scans.length; i++) {
        const [student_submitted, percent_watched] =
          this.checkIfStudentSubmittedToTask(qr_scans[i])
        if(student_submitted) {
          student_submitted_to_any_qr = true
          break
        }
      }
      return student_submitted_to_any_qr
    },
    async checkToRestrictStudent() {
      await this.createOrRetrieveStudentSubmission()
      if(this.submission.video_percent_watched < 100) {
        this.preventSeekingAndPeriodicallyUpdateSubmission()
        this.setViewMode(true)
      } else
        this.setViewMode(false)
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
          self.player = this
          let video = this
          let current_time = 0
          // start the video at a different time if user has watched
          if(self.submission.furthest_video_time > 0){
            current_time = self.submission.furthest_video_time
            video.currentTime(current_time)
          }
          console.log("video current time", video.currentTime())

          video.on("seeking", () => {
            if(video.currentTime() > self.submission.furthest_video_time) {
              video.currentTime(current_time);
            }
          });
          video.on("seeked", () => {
            if(video.currentTime() > self.submission.furthest_video_time) {
              video.currentTime(current_time);
            }
          });
          video.on('ended', () => {
            console.log("In ended")
            self.updateVideoSubmission(video.duration(), video.duration())
          });

          video.on('error', () => {
            console.log("Some error happened")
          })
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
    },
    setViewMode(is_restricted) {
      if(is_restricted) {
        this.view_mode = "Restricted Mode"
        this.popup_content = "You cannot scrub forward and the"
          + " percentage of the video you watch is being periodically tracked."
      } else {
        this.view_mode = "Unrestricted Mode"
        this.popup_content = "You can scrub through the video freely. No submission"
        + " is being tracked."
      }
    },
    allowFasterVideoViewing() {
      this.data_setup.playbackRates.push(1.5)
      this.data_setup.playbackRates.push(2)
    }
  }
};
</script>

<style scoped>
#watch-video {
  padding-left: 8rem;
  padding-right: 8rem;
  padding-top: 2rem;
  /*border: red solid;*/
}

#header-container {
  margin-bottom: 1rem;
}

#video-name {
  display: inline-block;
  vertical-align: top;
  margin-left: 4rem;
  /*border: blue solid;*/
}

.sub-header-container {
  width: 33.3%;
  color: #2C3E50;
  font-weight: bold;
}

#video-container {
  width: 90%;
  margin: auto;
  height: 40rem;
  /*border: blue solid;*/
}

#video_player {
  width: 100%;
  height: 100%;
}

@media (max-width: 768px) {
  #watch-video {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  #video-name {
    display: block;
    margin-left: 0;
    text-align: center;
  }
  .sub-header-container {
    width: 100%;
    margin-top: 1rem;
  }
  #video-container {
    width: 100%;
    height: 20rem;
  }
  #back-to-meeting-btn {
    /*border: blue solid;*/
    width: 10rem;
    margin: auto;
    margin-top: 2rem;
  }
}

</style>