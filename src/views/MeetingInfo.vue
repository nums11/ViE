<template>
  <div class="meeting-info">
    <!-- QR Scanning Container -->
    <div id="qr-scanning-container" v-if="qr_scanning_window_open">
      <button @click="closeQRScanningWindow" id="exit_preview_btn" tabindex="0" aria-label="Close QR Scanner">X</button>
      <qrcode-stream id="video_preview" @decode="attemptQRCheckinSubmission"></qrcode-stream>
    </div>

    <!-- Header -->
    <SquareLoader v-if="!meeting_has_loaded" />
    <div v-else class="header">
      <!-- Page Title -->
      <div class="inline-block page-title">Meeting Info</div>
      <sui-label v-if="meeting_is_live" class="inline-block" id="live-label">Live</sui-label>
      <div class="page-info-area">
        <!-- Meeting Info Side -->
        <div class="left-side">
            <h2 class="inline-block">{{ meeting == null ? '' : meeting.title }}</h2>
            <div class="details-area">
              <sui-label :style="{marginBottom: '5px'}" v-if="for_course">
                  Course
                  <sui-label-detail>{{ meeting == null ? '(untitled)' : meeting.course.name }}</sui-label-detail>
              </sui-label>
              <sui-label :style="{marginBottom: '5px'}" v-else>
                  Organization
                <sui-label-detail>{{ meeting == null ? 'N/A' : meeting.org.name }}</sui-label-detail>
              </sui-label>

              <sui-label class="venue-red" id="dept-text" :style="{marginBottom: '5px'}">
                  Dept
                <sui-label-detail>{{meeting == null ? '' : meeting.course.dept }} {{ meeting == null ? '' : meeting.course.course_number }}</sui-label-detail>
              </sui-label>
            </div>
        </div>
        <!-- Schedule Area -->
        <div class="right-side">
          <ActiveTasksList :active_tasks="active_tasks" />
<!--             <MeetingInfoScheduleSlider 
              :tasksInfo="tasks_summary"
              :manageScheduleTabClick="manageScheduleTabClick"
            /> -->
        </div>
      </div>
    </div>

    <div class="sidebar-area">
      <div class="instructor-info">
        <div class="name">Prof. David Goldschmidt</div>
        <div class="email-icon">
            <span class="icon-email"></span>
        </div>
      </div>
    </div>

    <!-- <div class="top-spacer"></div> -->

    <div class="content-area-wrapper">
      <div class="left-spacer"></div>
        <div class="content-area">
          <transition-group name="fade"mode="out-in">
            <SquareLoader key="3" v-if="!meeting_has_loaded" />
            <div key="1" v-if="task_focus == null">
              <div v-if="meeting.has_live_attendance">
                <!-- Todo - Only let student know about open and past checkins -->
                <div class="title">
                  <h3>({{ meeting.live_attendance.qr_checkins.length }}) Live Task<span v-if="meeting.live_attendance.qr_checkins.length != 1">s</span>
                  </h3>
                </div>
                  <TaskInfoModalInstructor 
                  v-for="(qr_checkin,i) in meeting.live_attendance.qr_checkins"
                  :task_number="i"
                  :task="qr_checkin"
                  :is_qr="true"
                  v-on:show-task-qr="showTaskQR"
                  v-on:show-qr-scanning-window="showQRScanningWindow"
                  v-on:show-task-attendance="showTaskAttendance" />
<!--                 <div v-if="is_instructor">
                  <TaskInfoModalInstructor 
                    v-for="(task, i) in tasks_summary"
                    :key="i"
                    :taskInfo="task"
                    :shouldFocus="focusTask"
                    :shouldFocusTaskAttendance="focusTaskAttendance"
                  />
                </div>
                <div v-else>
                  <TaskInfoModalInstructor 
                    v-for="(task, i) in tasks_summary"
                    :key="i"
                    :taskInfo="task"
                    :shouldFocus="focusTask"
                    :shouldFocusTaskAttendance="focusTaskAttendance"
                    v-on:show-qr-scanning-window="showQRScanningWindow"
                  />
                </div> -->
              </div>
              <div v-if="meeting.has_async_attendance">
                <!-- Todo - Only let student know about open and past checkins -->
                <div class="title">
                  <h3>({{ meeting.async_attendance.recordings.length }}) Asynchronous Task<span v-if="meeting.async_attendance.recordings.length != 1">s</span>
                  </h3>
                </div>
              </div>
            </div>
            <div key="2" v-else>
              <TaskInfoModalInstructorExpanded 
                v-if="task_focus_mode == 'show-info'"
                :task="focused_task"
                :cancelTask="cancelTask"
                :is_qr="focused_task.code != null"
              />
              <TaskAttendanceInfo 
                v-else-if="task_focus_mode == 'show-attendance'"
                :task="focused_task"
                :cancelTask="cancelTask"
                :is_qr="focused_task.code != null"
              />
            </div>
          </transition-group>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import MeetingInfoScheduleSlider from '@/components/MeetingInfoScheduleSlider.vue'
import ActiveTasksList from '@/components/ActiveTasksList.vue'
import TaskInfoModal from '@/components/TaskInfoModal.vue'
import TaskInfoModalExpanded from '@/components/TaskInfoModalExpanded.vue'
import TaskInfoModalInstructor from '@/components/TaskInfoModalInstructor.vue'
import TaskInfoModalInstructorExpanded from '@/components/TaskInfoModalInstructorExpanded.vue'
import TaskAttendanceInfo from '@/components/TaskAttendanceInfo.vue'
import SquareLoader from "@/components/Loaders/SquareLoader.vue"
import LiveSubmissionAPI from '@/services/LiveSubmissionAPI.js';
import MeetingAPI from '@/services/MeetingAPI.js';
import qrcode from '@chenfengyuan/vue-qrcode';
import { QrcodeStream } from 'vue-qrcode-reader'

export default {
    name: 'MeetingInfo',
    components: {
        MeetingInfoScheduleSlider,
        ActiveTasksList,
        TaskInfoModal,
        TaskInfoModalExpanded,
        TaskInfoModalInstructor,
        TaskInfoModalInstructorExpanded,
        TaskAttendanceInfo,
        QrcodeStream,
        SquareLoader
    },
    data () {
        return {
            task_focus: null,
            focused_task: {},
            task_focus_mode: String, // "show-info" or "show-attendance"
            tasks_summary: [],
            qr_scanning_window_open: false,
            current_user: {},
            meeting: {},
            active_tasks: [],
            for_course: Boolean,
            meeting_has_loaded: false,
            is_instructor: Boolean,
            meeting_is_live: false
        }
    },
    async created () {
      this.current_user = this.$store.state.user.current_user
      this.is_instructor = this.current_user.is_instructor
      await this.getMeeting ()
      this.getMeetingStatus()
      this.getActiveTasksForMeeting()
      this.meeting_has_loaded = true
    },
    methods: {
      isQrTask (taskInfo) {
        return taskInfo && taskInfo.qrCode
      },
      manageScheduleTabClick (props) {

        if (this.isQrTask (props)) {
          this.task_focus = props.id
          this.task_focus_mode = 'show-info'
        }
      },
      showQRScanningWindow() {
        this.qr_scanning_window_open = true
      },
      closeQRScanningWindow() {
        this.qr_scanning_window_open = false
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
      getStartTime () {
        if (this.meeting == null) return ''
        let start_ = new Date (this.meeting.start_time)
        let hours = (start_.getHours() + 1) % 12
        let minutes = start_.getMinutes() < 10 ? `0${start_.getMinutes()}` : start_.getMinutes()
        let suffix = start_.getHours() >= 11 ? 'pm' : 'am'
        return `${hours}:${minutes}${suffix}`
      },
      getEndTime () {
        if (this.meeting == null) return ''
        let end_ = new Date (this.meeting.end_time)
        let hours = (end_.getHours() + 1) % 12
        let minutes = end_.getMinutes() < 10 ? `0${end_.getMinutes()}` : end_.getMinutes()
        let suffix = end_.getHours() >= 11 ? 'pm' : 'am'
        return `${hours}:${minutes}${suffix}`
      },
      focusTask (task_id) {
          this.task_focus = task_id
          this.task_focus_mode = "show-info"
      },
      showTaskQR (task) {
          this.task_focus = -1
          console.log("In func")
          this.focused_task = task
          this.task_focus_mode = "show-info"
      },
      focusTaskAttendance (task_id) {
          this.task_focus = task_id
          this.task_focus_mode = "show-attendance"
      },
      showTaskAttendance(task) {
        this.task_focus = -1
        this.focused_task = task
        this.task_focus_mode = "show-attendance"
      },
      cancelTask () {
          this.task_focus = null
      },
      getMeetingStatus () {
        console.log("In this func")
        let current_time = new Date()
        this.meeting_is_live = current_time >= new Date(this.meeting.start_time) &&
          current_time <= new Date(this.meeting.end_time)
      },
      async getMeeting() {
        this.meeting_id = this.$route.params.meeting_id
        const response = await MeetingAPI.getMeeting(this.meeting_id)
        this.meeting = response.data
        console.log("meeting", this.meeting)
        this.for_course = this.meeting.for_course
      },
      getActiveTasksForMeeting () {
        let current_time = new Date ();
        if (this.meeting.has_live_attendance) {
          this.meeting.live_attendance.qr_checkins
          .forEach(qr_checkin => {
            if (this.isBetweenTimes(current_time, new Date(qr_checkin.qr_checkin_start_time),
              new Date(qr_checkin.qr_checkin_end_time))) {
              this.active_tasks.push(qr_checkin)
            }
          })
        }
        if(this.meeting.has_async_attendance) {
          this.meeting.async_attendance.recordings
          .forEach(recording => {
            if(this.isBetweenTimes(current_time, new Date(recording.recording_submission_start_time),
              new Date(recording.recording_submission_end_time))) {
              this.active_tasks.push(recording)
            }
          })
        }
      },
      isBetweenTimes(time, start_time, end_time) {
        return time >= start_time &&
          time <= end_time
      },
      createTasksSummary () {
        this.tasks_summary = this.active_tasks.map((task, i) => {
          if (Object.prototype.hasOwnProperty.call( task, 'qr_checkin_start_time' )) {
            return {
              taskType: 'qr-code',
              startTime: task.qr_checkin_start_time,
              endTime: task.qr_checkin_end_time,
              taskName: 'QR Submission',
              taskDescription: 'Scan the QR code to submit your attendance',
              qrCode: task.code,
              id: i,
              submissions: task.qr_checkin_submissions
            }
          }
        })
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
    }
}
</script>

<style lang="scss" scoped>
#qr-scanning-container {
  position: absolute;
  width: 100%;
  height: 90%;
  top: 0;
  z-index: 10;
  background-color: white;
}

.meeting-info {
  margin: auto;
  width: 89%;

  // Header, With title and Schedule Slider
  .header {

    .page-title {
      font-weight: 600;
    }

    #live-label {
      margin-left: 1rem;
      background-color: #5EFFB4;
    }

    .page-info-area {
      display: flex;
      margin-top: 1rem;

      .left-side {
        width: 25%;
        min-width: 300px;
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
      width: 300px;
      min-width: 300px;
  }
  // Left Hand Side Area
  .sidebar-area {
      width: 300px;
      // background-color: green;
      position: fixed;
      bottom: 0;
      top: 230px;
      left: 90px;
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
      margin-left: 30px;
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