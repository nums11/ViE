  
<template>

    <div class="meeting-info">

        <transition name="fade" mode="out-in">
        <div v-if="!meeting_has_loaded" key="1">
            <SquareLoader />
        </div>
        <div v-else key="2">
            <div class="header">

                <!-- Page Title -->
                <div class="page-title">Meeting Info</div>
                <div class="page-info-area">

                    <!-- Meeting Info Side -->
                    <div class="left-side">
                        <h2>{{ meeting == null ? '' : meeting.title }}</h2>
                        <div class="details-area">
                            <sui-label :style="{marginBottom: '5px'}" v-if="for_course">
                                Course
                                <sui-label-detail>{{ meeting == null ? '(untitled)' : meeting.course.name }}</sui-label-detail>
                            </sui-label>

                            <sui-label :style="{marginBottom: '5px'}" v-else>
                                Organization
                                <sui-label-detail>{{ meeting == null ? 'N/A' : meeting.org.name }}</sui-label-detail>
                            </sui-label>

                            <sui-label class="venue-red" :style="{marginBottom: '5px'}">
                                Dept
                                <sui-label-detail>{{meeting == null ? '' : meeting.course.dept }} {{ meeting == null ? '' : meeting.course.course_number }}</sui-label-detail>
                            </sui-label>

                            <sui-label :style="{marginBottom: '5px'}">
                                Time Block
                                <sui-label-detail>{{getStartTime()}} - {{getEndTime()}}</sui-label-detail>
                            </sui-label>
                        </div>
                    </div>

                    <!-- Schedule Area -->
                    <div class="right-side">
                        <MeetingInfoScheduleSlider 
                        :tasksInfo="[...live_tasks_summary, ...async_tasks_summary]"
                        :manageScheduleTabClick="manageScheduleTabClick"
                        />

                        <!-- Example of the Structure of the Data MeetingInfoScheduleSlider expects -->
                        <!-- <MeetingInfoScheduleSlider
                            :tasksInfo="[{
                                startTime: '2020-08-12T08:51:42.612Z',
                                endTime: '2020-08-12T10:51:42.612Z',
                                taskType: 'qr-code',
                                taskName: 'QR Attendance Submission',
                                taskDescription: 'Scan the QR code to submit your attendance for this meeting',
                                id: 1
                            },{
                                startTime: '2020-08-12T08:51:42.612Z',
                                taskType: 'poll',
                                taskName: 'Rate your summer break from 1 to 10',
                                taskDescription: 'Submit your results for the poll for your instructor to view',
                                id: 2
                            },{
                                startTime: '2020-08-12T08:51:42.612Z',
                                taskType: 'file-download',
                                taskName: 'Textbook PDF',
                                taskDescription: 'Download the file document uploaded by your instructor',
                                id: 3
                            },{
                                startTime: '2020-08-13T08:51:42.612Z',
                                taskType: 'file-download',
                                taskName: 'Lecture 1 PDF',
                                taskDescription: 'Download the file document uploaded by your instructor',
                                id: 4
                            },{
                                startTime: '2020-08-13T08:51:42.612Z',
                                taskType: 'file-download',
                                taskName: 'Lecture 2 PDF',
                                taskDescription: 'Download the file document uploaded by your instructor',
                                id: 5
                            },{
                                startTime: '2020-08-14T08:51:42.612Z',
                                taskType: 'file-download',
                                taskName: 'Lecture 3 PDF',
                                taskDescription: 'Download the file document uploaded by your instructor',
                                id: 6
                            }]"
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

            <div class="top-spacer"></div>
            <div class="content-area-wrapper">
                <div class="left-spacer"></div>
                <div class="content-area">

                    <transition
                        name="fade"
                        mode="out-in"
                    >
                    <div key="1" v-if="task_focus == null">
                        <div v-if="getLiveTaskCount() > 0" :style="{marginBottom: '30px'}">
                            <div class="title"><h3>{{ getLiveTaskString() }}</h3></div>
                            <div v-if="is_instructor">
                            <TaskInfoModalInstructor 
                                v-for="(task, i) in live_tasks_summary"
                                :key="i"
                                :taskInfo="task"
                                :shouldFocus="focusTask"
                                :shouldFocusTaskAttendance="focusTaskAttendance"
                            />
                            </div>
                            <div v-else>
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
                            </div>
                        </div>

                        <div v-if="getAsyncTaskCount() > 0">
                            <div class="title"><h3>{{ getAsyncTaskString() }}</h3></div>
                            <div v-if="is_instructor">
                                <TaskInfoModalInstructor 
                                    v-for="(task, i) in async_tasks_summary"
                                    :key="i"
                                    :taskInfo="task"
                                    :shouldFocus="focusTask"
                                    :shouldFocusTaskAttendance="focusTaskAttendance"
                                />
                            </div>
                            <div v-else-if="false">
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
                        </div>
                    </div>
                    <div key="2" v-else>
                    <TaskInfoModalInstructorExpanded 
                        v-if="is_instructor && task_focus_mode == 'show-info'"
                        :taskInfo="live_tasks_summary[task_focus]"
                        :cancelTask="cancelTask"
                        :students="students"
                    />
                    <TaskAttendanceInfo 
                        v-else-if="is_instructor && task_focus_mode == 'show-attendance'"
                        :taskInfo="live_tasks_summary[task_focus]"
                        :cancelTask="cancelTask"
                    />
                    <TaskInfoModalExpanded 
                        v-else
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
        </transition>

    </div>

</template>

<script>
import MeetingInfoScheduleSlider from '@/components/MeetingInfoScheduleSlider.vue'
import TaskInfoModal from '@/components/TaskInfoModal.vue'
import TaskInfoModalExpanded from '@/components/TaskInfoModalExpanded.vue'
import TaskInfoModalInstructor from '@/components/TaskInfoModalInstructor.vue'
import TaskInfoModalInstructorExpanded from '@/components/TaskInfoModalInstructorExpanded.vue'
import TaskAttendanceInfo from '@/components/TaskAttendanceInfo.vue'
import SquareLoader from "@/components/Loaders/SquareLoader.vue"

import LiveSubmissionAPI from '@/services/LiveSubmissionAPI.js';
import MeetingAPI from '@/services/MeetingAPI.js';
import UserAPI from '@/services/UserAPI.js';
import qrcode from '@chenfengyuan/vue-qrcode';
import { QrcodeStream } from 'vue-qrcode-reader'

export default {
    name: 'MeetingInfo',
    components: {
        MeetingInfoScheduleSlider,
        TaskInfoModal,
        TaskInfoModalExpanded,
        TaskInfoModalInstructor,
        TaskInfoModalInstructorExpanded,
        TaskAttendanceInfo,
        SquareLoader
    },
    data () {
        return {
            task_focus: null,
            task_focus_mode: String, // "show-info" or "show-attendance"
            live_tasks_summary: [],
            async_tasks_summary: [],

            current_user: {},
            meeting: null,
            live_tasks_arr: [],
            async_tasks_arr: [],
            students: [],
            for_course: Boolean,
            meeting_has_loaded: false,
            is_instructor: Boolean,
        }
    },
    created () {

      this.current_user = this.$store.state.user.current_user
      this.is_instructor = this.current_user.is_instructor

      this.getMeeting ()

    },
    methods: {

      getLiveTaskString () {
          let count = this.getLiveTaskCount ()
          if (count == 1) return '1 Live Task'
          return `${count} Live Tasks`
      },
      getAsyncTaskString () {
          let count = this.getAsyncTaskCount ()
          if (count == 1) return '1 Asynchronous Task'
          return `${count} Asynchronous Tasks`
      },

      getLiveTaskCount () {
          let count = 0;
          if (this.meeting && this.meeting.live_attendance) {
              count += this.meeting.live_attendance.live_polls ? this.meeting.live_attendance.live_polls.length : 0
              count += this.meeting.live_attendance.qr_checkins ? this.meeting.live_attendance.qr_checkins.length : 0
          }
          return count;
      },

      getAsyncTaskCount () {
          let count = 0;
          if (this.meeting && this.meeting.async_attendance) {
              count += this.meeting.async_attendance.recordings ? this.meeting.async_attendance.recordings.length : 0
          }
          return count
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
      focusTaskAttendance (task_id) {
          this.task_focus = task_id
          this.task_focus_mode = "show-attendance"
      },
      cancelTask () {
          this.task_focus = null
      },
      getMeeting () {

        let meeting_id = this.$route.params.meeting_id
        MeetingAPI.getMeeting(meeting_id)
        .then(res => {
          this.meeting = res.data
          this.for_course = this.meeting.for_course

          this.meeting_has_loaded = true

          // get active tasks now
          this.getActiveTasksForMeeting ()
          this.getStudents ()
        })
      },
      getStudents () {
          // this.students
          if (this.meeting.for_course) {
              this.students = this.meeting.course.students
          }
          else {
              this.students = this.eeting.org.general_members
          }

          // populate the students information
          let student_promises = []
          this.students.forEach(student_id => {

              student_promises.push(UserAPI.getUser(student_id))

          })

          Promise.all(student_promises)
          .then(all_students => {

              this.students = all_students.map(student_ => {
                  return student_.data
              })
          })

      },
      getActiveTasksForMeeting () {

        let current_time = new Date ();
        if (this.meeting.has_live_attendance) {
          this.meeting.live_attendance.qr_checkins
          .forEach(qr_checkin => {

            // if (current_time, new Date(qr_checkin.qr_checkin_start_time), new Date(qr_checkin.qr_checkin_end_time)) {
            this.live_tasks_arr.push(qr_checkin)
            

          })
        }

        if (this.meeting.has_async_attendance) {
            this.meeting.async_attendance.recordings
            .forEach(recording => {

                this.async_tasks_arr.push(recording)
            })
        }

        
        this.createTasksSummary ()
      },

      createTasksSummary () {

        this.live_tasks_summary = this.live_tasks_arr.map((task, i) => {

          if (Object.prototype.hasOwnProperty.call( task, 'qr_checkin_start_time' )) {
            return {
              taskType: 'qr-code',
              startTime: task.qr_checkin_start_time,
              endTime: task.qr_checkin_end_time,
              taskName: 'QR Submission',
              taskDescription: 'Scan the QR code to submit your attendance',
              qrCode: task.code,
              id: i,
              _id: task._id,
              meetingId: this.$route.params.meeting_id,
              taskMode: `async`,
              submissions: task.qr_checkin_submissions
            }
          }

        })

        this.async_tasks_summary = this.async_tasks_arr.map((task, i) => {

            if (Object.prototype.hasOwnProperty.call( task, 'video_url' )) {
                return {
                    taskType: 'recording',
                    startTime: task.recording_submission_start_time,
                    endTime: task.recording_submission_end_time,
                    taskName: 'Video Recording',
                    id: task._id,
                    taskDescription: 'Watch the video uploaded by your instructor',
                    meetingId: this.$route.params.meeting_id,
                    taskMode: `live`
                }
            }
        })
      }
    }
}
</script>

<style lang="scss">
.meeting-info {
    // Header, With title and Schedule Slider
    .header {
        position: fixed;
        left: 90px;
        right: 20px;
        top: 70px;
        z-index: 3;
        .page-title {
            font-weight: 600;
        }
        .page-info-area {
            display: flex;
            .left-side {
                width: 330px;
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