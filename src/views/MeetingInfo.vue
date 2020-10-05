<template>
  <div class="meeting-info">
    <!-- QR Scanning Window -->
    <QRScanningWindow v-if="show_qr_scanning_window"
    v-on:hide-window="hideQRScanningWindow"
    v-on:attempt-submission="attemptQRCheckinSubmission"/>
    <!-- Full Screen QR Modal -->
    <FullScreenQRCodeModal v-if="show_qr_code_modal"
      v-on:hide-modal="hideFullScreenQRCodeModal"
      :task="findMainQRTask()" 
      :code="full_screen_code" 
      :students="attendees"
    />
    <QRSuccessAnimation v-if="show_qr_success_animation" />

    <!-- Header -->
    <SquareLoader v-if="!meeting_has_loaded" />
    <div v-else class="header">
      <div class="inline-block page-title">Meeting Info</div>
      <sui-label v-if="meeting_is_live" class="inline-block" id="live-label" color="green">Live</sui-label>
      <div class="page-info-area">
        <!-- Page Info -->
        <div class="left-side">
            <h2 class="inline-block">{{ meeting == null ? '' : meeting.title }}</h2>
            <div class="details-area">
              <sui-label :style="{marginBottom: '5px'}">
                  Organization
                <sui-label-detail>{{ for_course ? meeting.course.name : meeting.org.name }}</sui-label-detail>
              </sui-label>
              <sui-label v-if="for_course" class="venue-red" id="dept-text" :style="{marginBottom: '5px'}">
                  Dept
                <sui-label-detail>{{ meeting.course.dept }} {{ getFormattedCourseNumber(meeting.course.course_number) }}</sui-label-detail>
              </sui-label>
            </div>
        </div>
        <!-- Active Tasks -->
        <div class="right-side">
          <ActiveTasksList :active_tasks="active_tasks"
          :for_course="for_course"
          :is_board_member="is_board_member"
          v-on:show-fullscreen-code="showFullScreenQRCodeModal"
          v-on:show-qr-scanning-window="showQRScanningWindow"/>
        </div>
      </div>
    </div>

    <!-- Sidebar -->
    <SquareLoader key="3" v-if="!meeting_has_loaded" />
    <div v-else class="sidebar-area">
      <div v-if="for_course" class="instructor-info">
        <sui-label class="venue-blue" icon="graduation cap" label-position="right" :style="{marginBottom: '5px'}" v-if="for_course">
            <sui-label-detail>{{ meeting.course.instructor.first_name }} {{ meeting.course.instructor.last_name }}</sui-label-detail>
        </sui-label>
        <sui-label class="venue-blue" icon="graduation cap" label-position="right" :style="{marginBottom: '5px'}" v-if="for_course && meeting.course.secondary_instructor">
            <sui-label-detail>{{ meeting.course.secondary_instructor.first_name }} {{ meeting.course.secondary_instructor.last_name }}</sui-label-detail>
        </sui-label>
      </div>

      <div v-if="current_user.is_instructor">
        <router-link :to="{name: 'add_recording', params: {meeting_id: meeting._id}}">
          <sui-button class="venue-blue">Add Recording</sui-button>
        </router-link>
      </div>
    </div>

    <!-- Body -->
    <SquareLoader v-if="!meeting_has_loaded" />
    <div v-else class="content-area-wrapper">
      <div class="left-spacer"></div>
        <div class="content-area">
          <!-- Tabs -->
          <sui-list v-if="is_instructor" id="meeting-tabs" horizontal>
            <sui-list-item 
            :class="'meeting-tab ' + (show_meeting_tasks ? 'solid-border-bottom' : '')"
            @click="showMeetingTasks">
              <sui-icon name="tasks" class="meeting-tab-icon" />
              Tasks
            </sui-list-item>
<!--             <sui-list-item
            :class="'meeting-tab ' + (show_meeting_tasks ? '' : 'solid-border-bottom')"
            id="attendance-tab"
            @click="showMeetingAttendance">
              <sui-icon name="users" class="meeting-tab-icon" />
              Attendance
            </sui-list-item> -->
            <sui-list-item v-if="is_instructor" 
            :class="'stats-tab ' + (show_meeting_stats ? 'solid-border-bottom' : '')"
            @click="showMeetingStats">
              <sui-icon name="chart line" class="stats-tab-icon" />
              Stats
            </sui-list-item>
          </sui-list>
          <!-- Meeting Tasks -->
          <div v-if="show_meeting_tasks">
            <transition-group name="fade" mode="out-in">
              <div key="1" v-if="task_focus == null">
                <div v-if="meeting.has_live_attendance">
                  <div class="title">
                    <h3 v-if="is_instructor">
                      ({{ meeting.live_attendance.qr_checkins.length }})
                      Live Tasks
                    </h3>
                    <h3 v-else>Live Tasks</h3>
                  </div>
                  <MeetingTaskList
                  :tasks="meeting.live_attendance.qr_checkins"
                  :is_live="true"
                  :attendees="attendees"
                  :for_course="for_course"
                  :is_board_member="is_board_member"
                  v-on:show-qr-scanning-window="showQRScanningWindow"
                  v-on:show-task-attendance="showTaskAttendance"
                  v-on:show-fullscreen-code="showFullScreenQRCodeModal" />
                </div>
                <div style="margin-top:3rem;" v-if="meeting.has_async_attendance">
                  <div class="title">
                    <h3 v-if="is_instructor">
                      ({{ meeting.async_attendance.recordings.length }}) 
                      Asynchronous Tasks
                    </h3>
                    <h3 v-else>Asynchronous Tasks</h3>
                  </div>
                  <MeetingTaskList
                  :tasks="meeting.async_attendance.recordings"
                  :is_live="false"
                  :attendees="attendees"
                  :for_course="for_course"
                  :is_board_member="is_board_member"
                  v-on:show-task-attendance="showTaskAttendance"  />
                </div>
              </div>
              <div key="2" v-else>
                <TaskInfoContainerExpanded 
                  v-if="task_focus_mode == 'show-info'"
                  :task="focused_task"
                  :cancelTask="cancelTask"
                  :is_qr="focused_task.code != null"
                  v-on:show-fullscreen-code="showFullScreenQRCodeModal"
                />
                <TaskAttendanceList 
                  v-else-if="task_focus_mode == 'show-attendance'"
                  :task="focused_task"
                  :attendees="attendees"
                  :cancelTask="cancelTask"
                />
              </div>
            </transition-group>
          </div>
          <!-- Stats -->
          <div v-else-if="show_meeting_stats">
            <h3>Attendance Stats</h3>
        <VenueChart 
            :chartData="chartData"
            :chartOptions="chartOptions"
            :labels="chartData.labels"
            :style="{height: '400px'}"
        />
          </div>
          <!-- Meeting Attendance -->
          <div v-else>
            <transition name="fade" mode="out-in">
              <MeetingAttendanceList key="1" :meeting="meeting" :attendees="attendees" />
            </transition>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import MeetingInfoScheduleSlider from '@/components/MeetingInfoScheduleSlider.vue'
import FullScreenQRCodeModal from '@/components/FullScreenQRCodeModal.vue';
import QRScanningWindow from '@/components/QRScanningWindow.vue';
import ActiveTasksList from '@/components/ActiveTasksList.vue'
import TaskInfoModal from '@/components/TaskInfoModal.vue'
import TaskInfoModalExpanded from '@/components/TaskInfoModalExpanded.vue'
import MeetingTaskList from '@/components/MeetingTaskList.vue'
import TaskInfoContainerExpanded from '@/components/TaskInfoContainerExpanded.vue'
import TaskAttendanceList from '@/components/TaskAttendanceList.vue'
import MeetingAttendanceList from '@/components/MeetingAttendanceList.vue';
import SquareLoader from "@/components/Loaders/SquareLoader.vue"
import LiveSubmissionAPI from '@/services/LiveSubmissionAPI.js';
import MeetingAPI from '@/services/MeetingAPI.js';
import qrcode from '@chenfengyuan/vue-qrcode';
import { FrontEndServerBaseURL } from '@/services/API.js';
import QRSuccessAnimation from '@/components/animations/QRSuccessAnimation.vue'
import  VenueChart  from "@/components/VenueChart.vue"

export default {
  name: 'MeetingInfo',
  components: {
    MeetingInfoScheduleSlider,
    FullScreenQRCodeModal,
    QRScanningWindow,
    ActiveTasksList,
    TaskInfoModal,
    TaskInfoModalExpanded,
    TaskInfoContainerExpanded,
    TaskAttendanceList,
    SquareLoader,
    MeetingTaskList,
    MeetingAttendanceList,
    QRSuccessAnimation,
    VenueChart,
    
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
      meeting_is_live: false,
      show_qr_code_modal: false,
      full_screen_code: "",
      show_qr_scanning_window: false,
      attendees: [],
      show_meeting_tasks: true,
      show_meeting_stats: false,
      is_board_member: false,
      show_qr_success_animation: false,

      chartData: {},
      chartOptions: {},
      present_attendees: [],
      absent_attendees: []
    }
  },
  async created () {
    this.current_user = this.$store.state.user.current_user
    this.is_instructor = this.current_user.is_instructor
    await this.getMeeting ()
    if(!this.for_course)
      this.checkIfCurrentUserIsBoardMember()
    console.log("Meeting",this.meeting)
    this.checkIfMeetingIsLive()
    this.getActiveTasksForMeeting()
    this.getMeetingAttendees()
    this.separateAttendees()
    this.meeting_has_loaded = true
    this.chartData = {
            labels: ['Present', 'Absent'],
            datasets:[ { 
            backgroundColor: ['#5EFFB4','#fe7073'],
            data: [((this.present_attendees.length/this.attendees.length)*100).toFixed(2),((this.absent_attendees.length/this.attendees.length)*100).toFixed(2)]
            }]
        },
        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                display: true
            }
        }

    
  },
  methods: {
    findMainQRTask () {
      if (this.meeting.live_attendance && this.meeting.live_attendance.qr_checkins) {
        return this.meeting.live_attendance.qr_checkins[0]
      }
      return null
    },
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
      if(this.isEmptyObj(open_checkin))
        alert("No Open QR Checkins")
      else if(`${FrontEndServerBaseURL()}/#/attend/${this.$route.params.meeting_id}/${open_checkin.code}` === scanned_code)
        this.createLiveSubmission(open_checkin)
      else 
        alert("Scanned invalid code!")
      this.hideQRScanningWindow()
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
    isEmptyObj(obj) {
      return Object.keys(obj).length === 0 && obj.constructor === Object
    },
    separateAttendees() {
      
        let submission_ids = this.getSubmissionIds()
        this.attendees.forEach(attendee => {
          if(submission_ids.has(attendee.user_id))
            this.present_attendees.push(attendee)
          else
            this.absent_attendees.push(attendee)
        })
      },
      getSubmissionIds() {
        let submission_ids = new Set()
        if(this.meeting.live_attendance){
          this.meeting.live_attendance.qr_checkins.forEach(qr_checkin => {
            
            let submissions = qr_checkin.qr_checkin_submissions

            submissions.forEach(submission => {
              submission_ids.add(submission.submitter.user_id)
            })
          })
        }
        if(this.meeting.async_attendance){
          this.meeting.async_attendance.recordings.forEach(recording => {
            let submissions = recording.recording_submissions
            submissions.forEach(submission => {
              submission_ids.add(submission.submitter.user_id)
            })
          })
        }
        return submission_ids
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
    checkIfMeetingIsLive () {
      let current_time = new Date()
      this.meeting_is_live = this.isBetweenTimes(current_time,
        new Date(this.meeting.start_time), new Date(this.meeting.end_time))
    },
    async getMeeting() {
      this.meeting_id = this.$route.params.meeting_id
      const response = await MeetingAPI.getMeeting(this.meeting_id)
      this.meeting = response.data
      this.for_course = this.meeting.for_course
    },
    getActiveTasksForMeeting () {
      let current_time = new Date ();
      if (this.meeting.has_live_attendance) {
        this.meeting.live_attendance.qr_checkins
        .forEach(qr_checkin => {
          if (this.isBetweenTimes(current_time, new Date(qr_checkin.qr_checkin_start_time),
            new Date(qr_checkin.qr_checkin_end_time))) {
            if(this.is_instructor)
              this.active_tasks.push(qr_checkin)
            else if(!this.studentSubmittedToQRCheckin(qr_checkin))
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
    
    
    
    getMeetingAttendees() {
      if(this.for_course)
        this.attendees = this.meeting.course.students
      else
        this.attendees = this.meeting.org.general_members
    },
    isBetweenTimes(time, start_time, end_time) {
      return time >= start_time &&
        time <= end_time
    },
    getWindowStatus(task, is_qr) {
      let current_time = new Date()
      let window_start = null
      let window_end = null
      if(is_qr) {
        window_start = new Date(task.qr_checkin_start_time)
        window_end = new Date(task.qr_checkin_end_time)
      } else {
        window_start = new Date(task.recording_submission_start_time)
        window_end = new Date(task.recording_submission_end_time)
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
    studentSubmittedToQRCheckin(qr_checkin) {
      let submissions = qr_checkin.qr_checkin_submissions
      let student_has_submitted = false
      for(let i = 0; i < submissions.length; i++) {
        if(submissions[i].submitter.user_id === this.current_user.user_id){
          student_has_submitted = true
          break
        }
      }
      return student_has_submitted
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
        submitter: this.$store.state.user.current_user._id,
        is_qr_checkin_submission: true,
        qr_checkin: open_checkin._id,
        live_submission_time: new Date()
      }
      const response = await LiveSubmissionAPI.addLiveSubmission(live_submission)
      this.show_qr_success_animation = true
      setTimeout(() => {
        this.show_qr_success_animation = false
        this.$router.go()
      }, 2000)
    },
    showFullScreenQRCodeModal (code) {
      this.full_screen_code = code
      this.full_screen_task = 
      this.show_qr_code_modal = true
    },
    hideFullScreenQRCodeModal() {
      this.full_screen_code = ""
      this.show_qr_code_modal = false
      this.$router.go()
    },
    showQRScanningWindow() {
      this.show_qr_scanning_window = true
    },
    hideQRScanningWindow() {
      this.show_qr_scanning_window = false
    },
    showMeetingTasks() {
      this.show_meeting_tasks = true
      this.show_meeting_stats = false
    },
    showMeetingStats(){
      this.show_meeting_stats = true
      this.show_meeting_tasks = false
    },
    showMeetingAttendance() {
      this.show_meeting_tasks = false
    },
    getFormattedCourseNumber(course_number) {
      let course_number_str = course_number.toString()
      let num_digits = course_number_str.length
      if(num_digits <= 4) {
        return course_number
      } else {
        return course_number_str.slice(0,4) + "/" + course_number_str.slice(4,num_digits)
      }
    },
    checkIfCurrentUserIsBoardMember() {
      let org_board_members = this.meeting.org.board_members
      console.log("Board members", org_board_members)
      for(let i = 0; i < org_board_members.length; i++) {
        if(org_board_members[i].user_id === this.current_user.user_id) {
          this.is_board_member = true
          break
        }
      }
      console.log("Is board member", this.is_board_member)
    }
  }
}
</script>

<style lang="scss" scoped>

#meeting-saving-modal {
  border: black solid;
  background-color: white;
  z-index: 10;
  height: 90%;
  width: 80%;
  position: absolute;
  margin-top: 0;
  margin-left: 10%;
  overflow-y: scroll;
  margin-bottom: 5rem;
  padding-top: 15rem;
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
  margin: auto;
  width: 89%;

  // Header, With title and Schedule Slider
  .header {

    .page-title {
      font-weight: 600;
    }

    #live-label {
      margin-left: 1rem;
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

      #meeting-tabs {

        .meeting-tab {
          font-size: 1.5rem;
          cursor:pointer;
          margin-bottom: 2rem;

          .meeting-tab-icon {
            margin-right: 0.5rem;
          }

        }

        #attendance-tab {
          margin-left: 5rem;
        }

      }

      .title {
          margin-top: 10px;
          margin-bottom: 10px;
      }

  }

}

.solid-border-bottom {
  border-bottom: black solid;
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