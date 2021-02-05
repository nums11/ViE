<template>
  <div id="watch-video">
    <div v-if="!video_has_loaded">
      <sui-loader active size="large">
        Loading Video...
      </sui-loader>
    </div>
    <div v-else>
      <show-at breakpoint="small">
        <div id="back-to-meeting-btn">
          <router-link
          :to="{name: 'meeting_info', params: {meeting_id: meeting_id}}">
            <sui-button content="Back to Meeting" icon="arrow left"
            label-position="left" style="margin:auto;" />
          </router-link>
        </div>
      </show-at>
      <div id="header-container">
        <h2 class="wrap-text" id="video-name">{{ video.name }}</h2>
        <hide-at breakpoint="small">
          <router-link
          :to="{name: 'meeting_info', params: {meeting_id: meeting_id}}">
            <sui-button content="Back to Meeting" icon="arrow left"
            label-position="left" class="inline-block float-right" />
          </router-link>
        </hide-at>
      </div>
      <div class="mt-1 inline-block" id="left-side">
        <div class="inline-block sub-header-container">
          Window:
          {{ async_portion.async_start | moment("M/D h:mm a") }} -
          {{ async_portion.async_end | moment("M/D h:mm a") }}
        </div>
        <div class="inline-block sub-header-container center-text">
          <span v-if="view_mode === 'Restricted Mode'">
            {{ submission.video_percent_watched.toFixed(1) }}% 
            watched<span v-if="quiz != null">,
              {{ submission.num_correct_answers }}/{{ quiz.questions.length }}
              Correct
              ({{  ((submission.num_correct_answers/
                quiz.questions.length) * 100).toFixed(1) }}%)
            </span>
          </span>
        </div>
        <div class="inline-block sub-header-container right-text">
          {{ view_mode }}
          <sui-popup :content="viewing_mode_popup_content" position="top center"
          inverted>
            <sui-icon slot="trigger" name="info circle" />
          </sui-popup>
        </div>
        <div id="viewing-options-container">
          <div v-if="video.allow_unrestricted_viewing_for_real_time_submitters"
          class="inline-block" id="unrestricted-text">
            Unrestricted viewing for real-time submitters enabled
            <sui-popup content="Students with real-time submissions
            can view this video in unrestricted mode" position="top center"
            inverted>
              <sui-icon slot="trigger" name="info circle" />
            </sui-popup>
          </div>
          <div v-if="video.allow_faster_viewing"
          class="inline-block sub-header-container center-text">
            Faster viewing enabled
            <sui-popup content="Students viewing this video in restricted
            mode can watch in up to 2x speed." position="top center"
            inverted>
              <sui-icon slot="trigger" name="info circle" />
            </sui-popup>
          </div>
        </div>
        <div id="video-container">
          <video id="video_player"
          class="video-js vjs-big-play-centered "
          :data-setup="JSON.stringify(data_setup)" playsinline >
            <source v-bind:src="video.url">
          </video>
        </div>
      </div>
      <div class="mt-1 inline-block center-text" id="right-side">
        <h3 >Quiz</h3>
        <h4 v-if="quiz != null">
          {{ quiz.questions.length }} questions
        </h4>
        <div id="right-side-content">
          <p id="no-quiz" v-if="quiz == null">No Quiz</p>
          <div v-else>
            <QuizQuestionTimeline v-if="!show_question"
            :questions="quiz.questions"
            :formatted_question_timestamps="
            formatted_question_timestamps"
            :unrestricted_mode="view_mode !== 'Restricted Mode'"
            v-on:show-quiz-question-unrestricted="
            showQuizQuestionUnrestricted" />
            <QuestionCard ref="QuestionCard"
            v-on:submit="updateQuizSubmission"
            v-on:resume-video="resumeVideo"
            v-on:hide-card="hideCard" />
          </div>
        </div>
      </div>
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
import QuizQuestionTimeline from
'@/components/QuizQuestionTimeline'
import QuestionCard from '@/components/QuestionCard'

export default {
  name: "WatchVideo",
  mixins: [helpers],
  data() {
    return {
      video: {},
      quiz: null,
      formatted_question_timestamps: [],
      video_has_loaded: false,
      submission: {},
      meeting_id: "",
      view_mode: "",
      viewing_mode_popup_content: "",
      data_setup: {
        "fluid": true,
        "playbackRates": [0.5,1],
        controls: true
      },
      show_question: false,
      show_another_question: false,
      current_question_index: 0
    }
  },
  props: {

  },
  components: {
    QuizQuestionTimeline,
    QuestionCard
  },
  async created() {
    this.meeting_id = this.$route.params.meeting_id
    this.video_id = this.$route.params.video_id
    try {
      await this.getAsyncPortion()
      if(this.video.quiz != null)
        this.assignQuizAndFormattedQuestionTimestamps()
      if(this.is_instructor || !this.isWithinAsyncPortionWindow()) {
        this.setViewMode(false)
        return
      }

      if(this.video.allow_unrestricted_viewing_for_real_time_submitters) {
        const response = await MeetingAPI.getMeeting(this.meeting_id)
        const meeting = response.data
        const student_submitted_to_any_qr =
          this.checkIfStudentSubmittedToAnyQR(meeting)
        console.log("student_submitted_to_any_qr", student_submitted_to_any_qr)
        if(student_submitted_to_any_qr) {
          this.setViewMode(false)
        } else {
          this.restrictStudentIfTheyHaveNotCompletedTheVideo()
        }
        return
      }

      this.restrictStudentIfTheyHaveNotCompletedTheVideo()
    } catch(error) {
      console.log(error)
      alert("Sorry, something went wrong")
    }
  },
  beforeDestroy() {
    // Deletes player so that if user returns to this page
    // restricted playback still works. videojs .dispose
    // function was broken
    if(this.player != null)
      delete videojs.getPlayers().video_player
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
    assignQuizAndFormattedQuestionTimestamps() {
      this.quiz = this.video.quiz
      this.quiz.questions.forEach(question => {
        const formatted_timestamp =
          this.getFormattedVideoTimestamp(question.video_timestamp)
        this.formatted_question_timestamps.push(formatted_timestamp)
      })
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
        const submission =
          this.checkIfStudentSubmittedToTask(qr_scans[i])
        if(submission != null) {
          student_submitted_to_any_qr = true
          break
        }
      }
      return student_submitted_to_any_qr
    },
    async restrictStudentIfTheyHaveNotCompletedTheVideo() {
      await this.createOrRetrieveStudentSubmission()
      if(this.submission.video_percent_watched < 100)
        this.setViewMode(true)
      else
        this.setViewMode(false)
    },
    async createOrRetrieveStudentSubmission() {
      const [submission_exists, submission]
        = this.submissionExistsForStudent()
      if(submission_exists) {
        this.submission = submission
        this.current_question_index =
          this.submission.quiz_answer_indices.length
      } else {
        const submission = {
          submitter: this.state_user._id,
          task_type: "Video"
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
    initVideo() {
      let self = this
      this.$nextTick(() => {
        videojs("video_player").ready(function() {
          self.player = this
          self.listenForArrowKeyPress()
          if(self.quiz != null)
            self.setVideoMarkers()
          let video = this
          if(self.view_mode === "Restricted Mode") {
            let current_time = 0
            // start the video at a different time if user has watched
            if(self.submission.furthest_video_time > 0){
              current_time = self.submission.furthest_video_time
              video.currentTime(current_time)
            }
            console.log("video current time", video.currentTime())

            video.on("seeking", () => {
              console.log("seeking")
              if(video.currentTime() > self.submission.furthest_video_time) {
                video.currentTime(self.submission.furthest_video_time);
              }
            });
            video.on("seeked", () => {
              console.log("seeked")
              if(video.currentTime() > self.submission.furthest_video_time) {
                video.currentTime(self.submission.furthest_video_time);
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
            // update_time_stamps is used to record every time the video is
            // updated so that only one API call is made every 5 seconds.
            // Otherwise multiple calls would be made since the 'timeupdate'
            // event fires multiple times a second
            let update_time_stamps = new Set()
            video.on('timeupdate', () => {
              const floored_time = Math.floor(video.currentTime())
              if(floored_time % 5 === 0
                && video.currentTime() > self.submission.furthest_video_time
                && !update_time_stamps.has(floored_time)) {
                  update_time_stamps.add(floored_time)
                  self.updateVideoSubmission(current_time, video.duration())
              }
              if(self.quiz != null) {
                if(self.shouldShowQuizQuestion()) {
                  if(video.isFullscreen()) {
                    video.exitFullscreen()
                  }
                  setTimeout(function() {
                    window.scrollTo(0,document.body.scrollHeight);
                  }, 250)
                  self.showQuizQuestion()
                }
              }
            })
          }
        })
      })
    },
    shouldShowQuizQuestion() {
      const floored_time = Math.floor(this.player.currentTime())
      return this.current_question_index < this.quiz.questions.length && 
              this.quiz.questions[this.current_question_index].video_timestamp
                  === floored_time
    },
    setVideoMarkers() {
      const unrestricted_mode
        = this.view_mode === "Unrestricted Mode"
      const markers = []
      for(let i = 0; i < this.quiz.questions.length; i++) {
        const question = this.quiz.questions[i]
        const marker_class = this.getMarkerClass(
          unrestricted_mode, i)
        markers.push({
          time: question.video_timestamp,
          text: question.question,
          class: marker_class
        })
      }
      this.player.markers({
        markerStyle: {
          'margin-bottom': '-3px',
          'height': '10px'
        },
        markerTip: {
          display: unrestricted_mode,
          text: function(marker) {
             return marker.text;
          },
        },
        markers: markers
      })
    },
    getMarkerClass(unrestricted_mode, question_index) {
      if(unrestricted_mode ||
        question_index >= this.submission.quiz_answer_indices.length)
        return "blue-marker"

      // Student has already answered the question
      // Green marker if they got the question right, red otherwise
      if(this.submission.quiz_answer_indices[question_index]
        === this.quiz.questions[question_index].correct_answer_index)
        return "green-marker"
      else
        return "red-marker"
    },
    showQuizQuestion() {
      // For multiple questions at the same timestamp
      if(this.show_question) {
        this.show_another_question = true
        return
      }
      const question = this.quiz.questions[
        this.current_question_index]
      this.player.pause()
      this.player.controls(false)
      this.show_question = true
      this.$refs.QuestionCard.showQuestion(question)
      this.current_question_index++
    },
    showQuizQuestionUnrestricted(question) {
      this.show_question = true
      this.$refs.QuestionCard.showQuestionUnrestricted(question)
    },
    hideCard() {
      this.show_question = false
    },
    async updateVideoSubmission(current_time, video_duration) {
      this.submission.furthest_video_time = current_time
      this.submission.video_percent_watched
        = (current_time / video_duration) * 100
      try {
        const response = await SubmissionAPI.updateSubmission(
          this.submission._id, this.submission)
        const updated_submission = response.data
        this.submission = updated_submission
        if(this.submission.video_percent_watched === 100) {
          window.alert("Video completed. You may now view this video"
            + " in unrestricted mode")
          this.$router.go()
        }
      } catch(error) {
        console.log(error)
        window.alert("Sorry, something went wrong")
      }
    },
    async updateQuizSubmission(selected_answer_index,
      user_was_correct) {
      try {
        this.submission.quiz_answer_indices.push(
          selected_answer_index)
        if(user_was_correct)
          this.submission.num_correct_answers++
        this.updateMarkerColor(user_was_correct)
        const response = await SubmissionAPI.updateSubmission(
          this.submission._id, this.submission)
        const updated_submission = response.data
        this.submission = updated_submission
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong")
      }
    },
    updateMarkerColor(user_was_correct) {
      const marker_class = user_was_correct ?
      'green-marker' : 'red-marker'
      // Deep Copy
      let markers = JSON.parse(JSON.stringify(
        this.player.markers.getMarkers()))
      markers[this.current_question_index-1].class = marker_class
      this.player.markers.reset(markers)
    },
    resumeVideo() {
      // For multiple questions at the same timestamp
      if(this.show_another_question) {
        this.show_question = false
        this.show_another_question = false
        this.showQuizQuestion()
      } else {
        this.show_question = false
        this.player.controls(true)
        this.player.play()
      }
    },
    setViewMode(is_restricted) {
      if(is_restricted) {
        this.view_mode = "Restricted Mode"
        this.viewing_mode_popup_content = "You cannot scrub forward to parts"
        + " of the video you haven't seen and the percentage of the video you"
        + " watch is being periodically tracked."
        if(this.video.allow_faster_viewing)
          this.allowFasterViewing()
        if(this.usingiOS())
          this.preventFullScreen()
      } else {
        this.view_mode = "Unrestricted Mode"
        this.viewing_mode_popup_content = "You can scrub through the video freely."
        + " No submission is being tracked and the video can be viewed in up to"
        + " 2x speed."
        this.allowFasterViewing()
      }
      this.video_has_loaded = true
      this.initVideo()
    },
    allowFasterViewing() {
      this.data_setup.playbackRates.push(1.5)
      this.data_setup.playbackRates.push(2)
    },
    usingiOS() {
      return [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod'
      ].includes(navigator.platform)
      // iPad on iOS 13 detection
      || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
    },
    preventFullScreen() {
      this.data_setup.playsinline = true
      this.data_setup.controlBar = {
        fullscreenToggle: false
      }
    }
  }
};
</script>

<style scoped>
#watch-video {
  padding-left: 3rem;
  padding-right: 3rem;
  padding-top: 2rem;
  /*border: red solid;*/
}

#header-container {
  /*margin-bottom: 1rem;*/
}

#video-name {
  display: inline-block;
  vertical-align: top;
  margin-left: 4rem;
  /*border: blue solid;*/
}

#left-side {
  /*border: blue solid;*/
  width: 65%;
  margin-left: 4rem;
  margin-bottom: 1rem;
}

#right-side {
  /*border: green solid;*/
  width: 31%;
}

#right-side-content {
  height: 30rem;
}

#no-quiz {
  font-size: 2rem;
  font-weight: bold;
  color: #949494;
  margin-top: 8rem;
}

.sub-header-container {
  width: 33.3%;
  color: #2C3E50;
  /*border: black solid;*/
  font-weight: bold;
}

#unrestricted-text {
  color: #2C3E50;
}

#viewing-options-container {
  margin-top: 1rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

#video-container {
  /*width: 90%;*/
  margin: auto;
  height: 35rem;
  margin-bottom: 4rem;
  /*border: blue solid;*/
}

#video_player {
  width: 100%;
  height: 100%;
  border: #c7c7c7 solid;
  box-shadow: 0px 15px 15px #c7c7c7;
}

/*Hide iOS video controls*/
video::-webkit-media-controls-panel,
video::-webkit-media-controls-panel-container,
video::-webkit-media-controls-start-playback-button {
    display:none !important;
    -webkit-appearance: none;
}

/* Tablets */
@media (max-width: 1128px) {
  #watch-video {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  #left-side {
    width: 60%;
    margin-left: 2rem;
  }
  #right-side {
    width: 35%;
    /*border: blue solid;*/
  }
}

@media (max-width: 760px) {
  #watch-video {
    padding-bottom: 1rem;
  }
  #video-name {
    display: block;
    margin-left: 0;
    text-align: center;
  }
  #left-side {
    /*border: blue solid;*/
    width: 100%;
    margin: auto;
  }
  .sub-header-container {
    width: 100%;
    margin-top: 1rem;
    text-align: center;
    /*border: black solid;*/
  }
  #unrestricted-text {
    margin-top: 1rem;
    text-align: center;
    display: block;
  }
  #viewing-options-container {
    margin-top: 0rem;
  }
  #video-container {
    width: 100%;
    height: 20rem;
    margin-bottom: 1rem;
  }
  #right-side {
    /*border: green solid;*/
    margin-top: 2rem;
    width: 100%;
    max-height: 35rem;
    overflow-y: auto;
  }
  #right-side-content {
    /*border: red solid;*/
    /*height: 6rem;*/
    min-height: 6rem;
    max-height: 300rem;
  }
  #no-quiz {
    margin-top: 2rem;
  }
  #back-to-meeting-btn {
    width: 10rem;
    margin: auto;
    /*margin-top: 2rem;*/
    margin-bottom: 2rem;
  }
}

</style>