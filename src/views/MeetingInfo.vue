<template>
  <div class="meeting-info">
<!--     <div class="spinner-border" role="status" v-if="!meeting_has_loaded">
        <span class="sr-only">Loading...</span>
    </div>
    <div v-else> -->
      <!-- Meeting Info -->
<!--       <h1>{{ meeting.title }}</h1>
      <h2 v-if="for_course">{{ meeting.course.name }}</h2>
      <h2 v-else>{{ meeting.org.name }}</h2>

      <div v-if="meeting.has_live_attendance">
 -->        <!-- QR Code Modal -->
<!--         <div class="hidden" id="qr_modal">
          <qrcode v-bind:value="current_qr_code" :options="{ width: 600 }"></qrcode>
          <button class="btn btn-secondary" id="close_qr_btn" @click="hideQRCode" aria-label="Hide QR">Hide</button>
        </div> -->
        <!-- QR SCanning Window -->
<!--         <div id="qr-scanning-container" v-if="qr_scanning_window_open">
          <button @click="closeQRScanningWindow" id="exit_preview_btn" tabindex="0" aria-label="Close QR Scanner">X</button>
          <qrcode-stream id="video_preview" @decode="attemptQRCheckinSubmission"></qrcode-stream>
        </div> -->
        <!-- Live Attendance -->
<!--         <h2 style="margin-top:5rem; text-decoration:underline;">Live Attendance</h2>
        <h3 style="text-decoration:underline;">QR Checkins</h3> -->
        <!-- Instructor QR Boxes -->
<!--         <div v-if="is_instructor">
          <div class="attendance-box" v-for="qr_checkin in meeting.live_attendance.qr_checkins">
            <p style="font-weight:bold;" v-if="getWindowStatus(qr_checkin, true) === 'upcoming'">Upcoming</p>
            <button v-else-if="getWindowStatus(qr_checkin, true) === 'open'" @click="showQRCode(qr_checkin.code)">Show QR</button>
            <p style="font-weight:bold;" v-else>Closed</p>
            <h4>checkin start: {{ new Date(qr_checkin.qr_checkin_start_time) }}</h4>
            <h4>checkin end: {{ new Date(qr_checkin.qr_checkin_end_time) }}</h4>
            <h4 style="text-decoration:underline;">Submissions</h4>
            <h4 v-for="submission in qr_checkin.qr_checkin_submissions">
              <p>
                {{ submission.submitter.first_name }} {{ submission.submitter.last_name }} ({{ submission.submitter.user_id }})
              </p>
            </h4>
          </div>
        </div> -->
        <!-- Student QR Boxes -->
<!--         <div v-else>
          <div class="attendance-box" v-for="qr_checkin in meeting.live_attendance.qr_checkins">
          <p v-if="getWindowStatus(qr_checkin, true) === 'closed'">QR Checkin Closed</p>
          <div v-else-if="getWindowStatus(qr_checkin, true) === 'open'">
            <button v-if="!submissionExistsForUser(qr_checkin)" @click="showQRScanningWindow">Scan QR</button>
            <p style="font-weight:bold;" v-else>Attendance Recorded</p>
            <h4>checkin start: {{ new Date(qr_checkin.qr_checkin_start_time) }}</h4>
            <h4>checkin end: {{ new Date(qr_checkin.qr_checkin_end_time) }}</h4>
          </div>
          </div>
        </div>
        <h3 style="text-decoration:underline;">Live Polls</h3>
      </div>

      <div v-if="meeting.has_async_attendance">
        <h2 style="margin-top:5rem; text-decoration:underline;">Async Attendance</h2>
        <h3 style="text-decoration:underline;">Recordings</h3>
        <div  class="attendance-box" v-for="recording in meeting.async_attendance.recordings">
          <p style="font-weight:bold;" v-if="getWindowStatus(recording, false) === 'upcoming'">Upcoming</p>
          <div v-else-if="getWindowStatus(recording, false) === 'open'">
            <p>Open</p>
            <router-link :to="{name: 'watch_recording', params: { recording_id: recording._id }}">
              <button>Watch Recording</button>
            </router-link>
          </div>
          <div style="font-weight:bold;" v-else>
            <p>Closed</p>
            <router-link :to="{name: 'watch_recording', params: { recording_id: recording._id }}">
              <button>Watch Recording</button>
            </router-link>
          </div>
          <h4>recording submission start: {{ new Date(recording.recording_submission_start_time) }}</h4>
          <h4>recording submission end: {{ new Date(recording.recording_submission_end_time) }}</h4>
          <h4 style="text-decoration:underline;">Submissions</h4>
          <h4 v-for="submission in recording.recording_submissions">
            <p>
              {{ submission.submitter.first_name }} {{ submission.submitter.last_name }} ({{ submission.submitter.user_id }})
            </p>
            <p>Furthest video time: {{ submission.furthest_video_time }}</p>
            <p>Video percent: {{ submission.video_percent_watched }}</p>
          </h4>
        </div>
      </div>
    </div> -->
  <div class="hidden" id="qr_modal">
    <qrcode v-bind:value="current_qr_code" :options="{ width: 600 }"></qrcode>
    <button class="btn btn-secondary" id="close_qr_btn" @click="hideQRCode" aria-label="Hide QR">Hide</button>
  </div>
  <div id="qr-scanning-container" v-if="qr_scanning_window_open">
    <button @click="closeQRScanningWindow" id="exit_preview_btn" tabindex="0" aria-label="Close QR Scanner">X</button>
    <qrcode-stream id="video_preview" @decode="attemptQRCheckinSubmission"></qrcode-stream>
  </div>

  <div class="header">
    <!-- Page Title -->
    <div class="page-title">Meeting Info</div>
    <SquareLoader v-if="!meeting_has_loaded" />
    <div v-else class="page-info-area">
      <!-- Meeting Info Side -->
      <div class="left-side">
        <h2>{{ meeting.title }}</h2>
        <div class="details-area">
          <sui-label :style="{marginBottom: '5px'}">
              Course
            <sui-label-detail>{{ meeting.course.name }}</sui-label-detail>
          </sui-label>

          <sui-label class="venue-red" :style="{marginBottom: '5px'}">
              Dept
            <sui-label-detail>{{ meeting.course.dept }} {{ meeting.course.course_number }}</sui-label-detail>
          </sui-label>

<!--           <sui-label :style="{marginBottom: '5px'}">
              Time Block
            <sui-label-detail>3:00pm - 4:00pm</sui-label-detail>
          </sui-label> -->
        </div>
      </div>

      <!-- Schedule Area -->
      <div class="right-side">
        <MeetingInfoScheduleSlider v-on:show-qr-code="showQRCode" v-bind:active_tasks="active_tasks"/>
      </div>
    </div>
  </div>

  <SquareLoader v-if="!meeting_has_loaded" />
  <div v-else class="sidebar-area">
    <div class="instructor-info">
      <div class="name">Prof. {{ meeting.course.instructor.first_name }} {{ meeting.course.instructor.last_name }}</div>
<!--       <div class="email-icon">
          <span class="icon-email"></span>
      </div> -->
    </div>
  </div>

  <div class="top-spacer"></div>
  <div class="content-area-wrapper">
    <div class="left-spacer"></div>
      <div class="content-area">
        <transition name="fade" mode="out-in">
          <div key="1" v-if="task_focus == null">
              <div class="title"><h3>2 Live Tasks</h3></div>
              <TaskInfoModal
                :taskInfo="{
                  startTime: '2020-08-12T02:51:42.612Z',
                  endTime: '2020-08-12T10:51:42.612Z',
                  taskType: 'qr-code',
                  taskName: 'QR Submission',
                  taskDescription: 'Scan the QR code to submit your attendance',
                  id: 1
                }"
                :shouldFocus="focusTask"
              />
              <TaskInfoModal
                :taskInfo="{
                  startTime: '2020-08-12T02:51:42.612Z',
                  taskType: 'poll',
                  taskName: 'Poll',
                  taskSubname: 'How many days do you need to complete the assignment?',
                  taskDescription: 'Answer the poll before the submission time ends.',
                  id: 2
                }"
                :shouldFocus="focusTask"
              />
              <TaskInfoModal
                :taskInfo="{
                  startTime: '2020-08-14T02:51:42.612Z',
                  taskType: 'file-download',
                  taskName: 'Lecture 3 PDF',
                  taskSubname: 'GalaxiesTextbook.pdf',
                  taskDescription: 'Download the file document uploaded by your instructor',
                  id: 3
                }"
                :shouldFocus="focusTask"
              />
              <TaskInfoModal
                :taskInfo="{
                  startTime: '2020-08-12T02:51:42.612Z',
                  taskType: 'link',
                  taskName: 'Physics Web Module',
                  taskSubname: 'Play around with the physics module',
                  taskDescription: 'Click the link',
                  id: 4
                }"
                :shouldFocus="focusTask"
              />
              <TaskInfoModal
                :taskInfo="{
                  startTime: '2020-08-12T02:51:42.612Z',
                  taskType: 'file-download',
                  taskName: 'Physics Textbook',
                  taskSubname: 'IntroToPhysics.pdf',
                  taskDescription: 'Download the file document uploaded by your instructor',
                  id: 5
                }"
                :shouldFocus="focusTask"
              />
              <TaskInfoModal
                :taskInfo="{
                  startTime: '2020-08-12T02:51:42.612Z',
                  taskType: 'recording',
                  taskName: 'Prerecorded Lecture 1',
                  taskSubname: 'Intro to Physics',
                  taskDescription: 'Watch the recording uploaded by your instructor',
                  id: 6
                }"
                :shouldFocus="focusTask"
              />

              <div class="title"><h3>2 Asynchronous Tasks</h3></div>
              <TaskInfoModal
                :taskInfo="{
                  startTime: '2020-08-12T02:51:42.612Z',
                  endTime: '2020-08-12T10:51:42.612Z',
                  taskType: 'qr-code',
                  taskName: 'QR Submission',
                  taskDescription: 'Scan the QR code to submit your attendance',
                  id: 7
                }"
                :shouldFocus="focusTask"
              />
              <TaskInfoModal
                :taskInfo="{
                  startTime: '2020-08-12T02:51:42.612Z',
                  taskType: 'poll',
                  taskName: 'Poll',
                  taskSubname: 'How many days do you need to complete the assignment?',
                  taskDescription: 'Answer the poll before the submission time ends.',
                  id: 8
                }"
                :shouldFocus="focusTask"
              />
              <TaskInfoModal
                :taskInfo="{
                  startTime: '2020-08-14T02:51:42.612Z',
                  taskType: 'file-download',
                  taskName: 'Lecture 3 PDF',
                  taskSubname: 'GalaxiesTextbook.pdf',
                  taskDescription: 'Download the file document uploaded by your instructor',
                  id: 9
                }"
                :shouldFocus="focusTask"
              />
              <TaskInfoModal
                :taskInfo="{
                  startTime: '2020-08-12T02:51:42.612Z',
                  taskType: 'link',
                  taskName: 'Physics Web Module',
                  taskSubname: 'Play around with the physics module',
                  taskDescription: 'Click the link',
                  id: 10
                }"
                :shouldFocus="focusTask"
              />
              <TaskInfoModal
                :taskInfo="{
                  startTime: '2020-08-12T02:51:42.612Z',
                  taskType: 'file-download',
                  taskName: 'Physics Textbook',
                  taskSubname: 'IntroToPhysics.pdf',
                  taskDescription: 'Download the file document uploaded by your instructor',
                  id: 11
                }"
                :shouldFocus="focusTask"
              />
              <TaskInfoModal
                :taskInfo="{
                  startTime: '2020-08-12T02:51:42.612Z',
                  taskType: 'recording',
                  taskName: 'Prerecorded Lecture 1',
                  taskSubname: 'Intro to Physics',
                  taskDescription: 'Watch the recording uploaded by your instructor',
                  id: 12
                }"
                :shouldFocus="focusTask"
              />
          </div>
          <div key="2" v-else>
            <TaskInfoModalExpanded 
                :taskInfo="{
                  startTime: '2020-08-12T02:51:42.612Z',
                  taskType: 'poll',
                  taskName: 'Poll',
                  taskSubname: 'How many days do you need to complete the assignment?',
                  taskDescription: 'Answer the poll before the submission time ends.',
                  pollOptions: [1, 2, 3, 4],
                  id: 8
                }"
                :cancelTask="cancelTask"
            />
          </div>
        </transition>

      </div>
    </div>
  </div>
</template>

<script>
  import MeetingAPI from '@/services/MeetingAPI.js';
  import SquareLoader from "@/components/Loaders/SquareLoader.vue"
  import qrcode from '@chenfengyuan/vue-qrcode';
  import { QrcodeStream } from 'vue-qrcode-reader'
  import LiveSubmissionAPI from '@/services/LiveSubmissionAPI.js';
  import MeetingInfoScheduleSlider from '@/components/MeetingInfoScheduleSlider.vue'
  import TaskInfoModal from '@/components/TaskInfoModal.vue'
  import TaskInfoModalExpanded from '@/components/TaskInfoModalExpanded.vue'

  export default {
    name: 'MeetingInfo',
    components: {
      qrcode,
      QrcodeStream,
      MeetingInfoScheduleSlider,
      TaskInfoModal,
      TaskInfoModalExpanded,
      SquareLoader
    },
    data(){
      return {
        meeting: {},
        current_user: {},
        meeting_has_loaded: false,
        for_course: Boolean,
        checkin_window_open: false,
        current_qr_code: String,
        is_instructor: false,
        qr_scanning_window_open: false,
        task_focus: null,
        active_tasks: []
      }
    },
    async created() {
      this.current_user = this.$store.state.user.current_user
      this.is_instructor = this.current_user.is_instructor
      await this.getMeeting()
      this.getActiveTasksForMeeting()
    },
    methods: {
      focusTask (task_id) {
          console.log(`Focusing task ${task_id}`)
          this.task_focus = true
      },
      cancelTask () {
          this.task_focus = null
      },
      async getMeeting() {
        this.meeting_id = this.$route.params.meeting_id
        const response = await MeetingAPI.getMeeting(this.meeting_id)
        this.meeting = response.data
        this.for_course = this.meeting.for_course
        this.meeting_has_loaded = true
      },
      getActiveTasksForMeeting() {
        let current_time = new Date()
        if(this.meeting.has_live_attendance) {
          this.meeting.live_attendance.qr_checkins
          .forEach(qr_checkin => {
            if(current_time, new Date(qr_checkin.qr_checkin_start_time),
              new Date(qr_checkin.qr_checkin_end_time))
              this.active_tasks.push(qr_checkin)
          })
          // Add polls later
        }

        if(this.meeting.has_async_attendance) {
          this.meeting.async_attendance.recordings
          .forEach(recording => {
            if(current_time, new Date(recording.recording_submission_start_time),
              new Date(recording.recording_submission_end_time))
              this.active_tasks.push(recording)
          })
        }
      },
      isBetweenTimes(time, start_time, end_time) {
        return time >= start_time &&
          time <= end_time
      },
      getWindowStatus(attendance, is_qr) {
        let current_time = new Date()
        let window_start = null
        let window_end = null
        if(is_qr) {
          window_start = new Date(attendance.qr_checkin_start_time)
          window_end = new Date(attendance.qr_checkin_end_time)
        } else {
          window_start = new Date(attendance.recording_submission_start_time)
          window_end = new Date(attendance.recording_submission_end_time)
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
      showQRCode(code) {
        this.current_qr_code = code
        document.getElementById("qr_modal").classList.remove("hidden")
      },
      hideQRCode() {
        document.getElementById("qr_modal").classList.add("hidden")
      },
      showQRScanningWindow() {
        this.qr_scanning_window_open = true
      },
      closeQRScanningWindow() {
        this.qr_scanning_window_open = false
      },
      isEmptyObj(obj) {
        return Object.keys(obj).length === 0 && obj.constructor === Object
      },
      attemptQRCheckinSubmission(scanned_code) {
        let open_checkin = this.getOpenQRCheckin()
        console.log("Open checkin", open_checkin)
        console.log("Open Checkin code", open_checkin.code)
        console.log("Scanned code", scanned_code)
        if(this.isEmptyObj(open_checkin))
          alert("No Open QR Checkins")
        else if(open_checkin.code === scanned_code)
          this.createLiveSubmission(open_checkin)
        else 
          alert("Scanned invalid code!")
        this.closeQRScanningWindow()
      },
      getOpenQRCheckin() {
        let open_checkin = {}
        let meeting_checkins = this.meeting.live_attendance.qr_checkins
        for(let i = 0; i < meeting_checkins.length; i++) {
          if(this.getWindowStatus(meeting_checkins[i], true) === "open"){
            open_checkin = meeting_checkins[i]
            break
          }
        }
        return open_checkin
      },
      async createLiveSubmission(open_checkin) {
        let live_submission = {
          submitter: this.$store.state.user.current_user,
          is_qr_checkin_submission: true,
          qr_checkin: open_checkin,
          live_submission_time: new Date()
        }
        const response = await LiveSubmissionAPI.addLiveSubmission(live_submission)
        alert("Live Submission Recorded")
        this.$router.go()
      },
      submissionExistsForUser(qr_checkin) {
        let submissions = qr_checkin.qr_checkin_submissions
        let user_submission_exists = false
        for(let i = 0; i < submissions.length; i++){
          if(submissions[i].user_id === this.current_user.usr_id){
            user_submission_exists = true
            break
          }
        }
        return user_submission_exists
      }
    }
  }
</script>

<style lang="scss" scoped>
.attendance-box {
  border: black solid;
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.hidden {
  display: none;
}

#qr_modal {
  position: absolute;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  z-index: 10;
  background-color: white;
}

#qr-scanning-container {
  position: absolute;
  width: 100%;
  height: 90%;
  top: 0;
  z-index: 10;
  background-color: white;
}


.meeting-info {
  width: 90%;
  margin:auto;
    // Header, With title and Schedule Slider
    .header {
        z-index: 3;
        .page-title {
            font-weight: 600;
        }
        .page-info-area {
            display: flex;
            .left-side {
                width: 360px;
                min-width: 360px;
            }
            .right-side {
                width: 75%;
                position: relative;
            }
        }
    }
    .top-spacer {
        height: 138px;
    }
    .left-spacer {
        width: 360px;
        min-width: 360px;
    }
    // Left Hand Side Area
    .sidebar-area {
        width: 360px;
        // background-color: green;
        position: fixed;
        bottom: 0;
        top: 230px;
        left: 155px;
        right: 50px;
        z-index: 3;
        .instructor-info {
            display: flex;
            align-items: center;
            height: 40px;
            width: 300px;
            margin-bottom: 30px;
            .name {
                flex-grow: 1;
            }
            .email-icon {
                width: 20px;
                height: 20px;
                line-height: 25px;
                font-size: 1.2rem;
                text-align: center;
            }
        }
    }
    // Main body area
    .content-area-wrapper {
        display: flex;
    }
    .content-area {
        position: relative;
        width: 72%;
        margin-right: 30px;
        box-sizing: border-box;
        .title {
            margin-top: 10px;
            margin-bottom: 10px;
        }
    }
}
.dark-mode {
    .meeting-info {
        .page-title {
            background-color: #121419;
        }
        .page-info-area {
            .left-side {
                background-color: #121419;
            }
            .right-side {
                background-color: #121419;
            }
        }
    }
}
.light-mode {
    .meeting-info {
        .page-title {
            background-color: white;
        }
        .page-info-area {
            .left-side {
                background-color: white;
            }
            .right-side {
                background-color: white;
            }
        }
    }
}
@media only screen and (max-width: 900px) {
  .meeting-info {
    .header {
        position: relative;
        display: contents;
        
        .page-info-area {
            display: block;
            .left-side {
                width: 100%;
            }
            .right-side {
                width: 100%;
                position: relative;
                margin-top: 50px;
            }
        }
    }
    .sidebar-area {
        position: static;
        display: contents;
    }
    .top-spacer {
        height: 0px;
    }
    .left-spacer {
        width: 0px;
        min-width: 0px;
    }
    .content-area {
        position: relative;
        width: 100%;
    }
  }
}


</style>