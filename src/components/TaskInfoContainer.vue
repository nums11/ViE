<template>
  <div class="task-info-container">
    <!-- Upper Area -->
    <div class="upper-area">
      <div class="left-side">
          <div class="title-area">
            <h4 v-if="is_qr">QR Submission</h4>
            <h4 v-else>Recording</h4>
          </div>
          <div v-if="is_qr" class="subtitle-area">
            {{ new Date(task.qr_checkin_start_time) | moment("dddd, MMMM Do, h:mm a") }} - {{ new Date(task.qr_checkin_end_time) | moment("dddd, MMMM Do, h:mm a") }}
          </div>
          <div v-else class="subtitle-area">
            {{ new Date(task.recording_submission_start_time) | moment("dddd, MMMM Do, h:mm a") }} - {{ new Date(task.recording_submission_end_time) | moment("dddd, MMMM Do, h:mm a") }}
          </div>
      </div>
      <div class="right-side">
        <div class="icon-area">
          <img v-if="is_qr" src="@/assets/icons/001-qr-code.svg" width="100%" height="100%" />
          <img v-else src="@/assets/icons/003-play-button.svg" width="45%" height="100%" />
        </div>
      </div>
    </div>
    <!-- Lower Area -->
    <div v-if="is_instructor" class="lower-area">
      <div class="left-side">
        <sui-progress class="attendance-progress" progress
        :percent="task_attendance_percentage" color="green"/>
      </div>
      <div class="right-side">
        <sui-button class="float-right venue-blue" @click="$emit('show-task-attendance',task)"
        content="View Attendance" icon="users" label-position="right" />
        <sui-button class="float-right" v-if="is_qr && task_window_status === 'open'" @click="$emit('show-task-qr',task)"
        content="Show QR Code" icon="qrcode" label-position="right" color="teal" />
      </div>
    </div>
    <div v-else class="lower-area">
      <div class="left-side">
        <div v-if="is_qr">
          <sui-label v-if="studentSubmittedToTask(task)" color="teal">
            <span>Submission Recorded</span>
            <sui-icon style="margin-left:1rem;" name="check circle" />
          </sui-label>
          <div v-else>
            <sui-button v-if="task_window_status === 'open'"
            @click="$emit('show-qr-scanning-window')"
            content="Scan QR Code" icon="qrcode" label-position="right" color="teal" />
            <sui-label v-else color="red">
              <span>No Submission</span>
              <sui-icon style="margin-left:1rem;" name="x" />
            </sui-label>
          </div>
        </div>
        <div v-else>
          <!-- Do something else for recordings -->
        </div>
      </div>
      <div class="right-side">
        <span class="float-right" v-if="studentSubmittedToTask(task)">Submitted on {{ new Date(student_task_submission.live_submission_time) | moment("dddd, MMMM Do YYYY, h:mm a") }}</span> 
        <router-link v-else
        :to="{name: 'watch_recording', params: {recording_id: task._id}}">
          <sui-button content="Watch Recording" icon="play circle"
          label-position="right" color="violet" />
        </router-link>
      </div>
    </div>
  </div>
</template>
<script>

export default {
  name: 'TaskInfoContainer',
  props: {
    task: {
      type: Object,
      required: true
    },
    is_qr: {
      type: Boolean,
      required: true
    },
    attendees: {
      type: Array,
      required: true
    },
    task_number: Number,
  },
  components: {
  },
  data () {
    return {
      student_task_submission: {},
      task_attendance_percentage: 0,
      task_window_status: false
    }
  },
  created () {
    this.current_user = this.$store.state.user.current_user
    this.is_instructor = this.current_user.is_instructor
    if(this.is_instructor)
      this.getTaskAttendancePercentage()
    this.task_window_status = this.getWindowStatus(this.task,this.is_qr)
  },
  methods: {
    studentSubmittedToTask(task) {
      let submissions = this.is_qr ? task.qr_checkin_submissions
      : task.recording_submissions
      let student_has_submitted = false
      for(let i = 0; i < submissions.length; i++) {
        if(submissions[i].submitter.user_id === this.current_user.user_id){
          student_has_submitted = true
          this.student_task_submission = submissions[i]
          break
        }
      }
      return student_has_submitted
    },
    getTaskAttendancePercentage() {
      let submission_ids = this.getSubmissionIds()
      let num_submitters = 0
      this.attendees.forEach(attendee => {
        if(submission_ids.has(attendee.user_id))
          num_submitters++
      })
      this.task_attendance_percentage = 
        ((num_submitters/this.attendees.length) * 100).toFixed(0)
    },
    getSubmissionIds() {
      let task_submissions = this.is_qr ? 
      this.task.qr_checkin_submissions :
      this.task.recording_submissions
      let submission_ids = new Set()
      task_submissions.forEach(submission => {
        submission_ids.add(submission.submitter.user_id)
      })
      return submission_ids
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
  }
}
</script>
<style lang="scss">
.task-info-container {
    margin-top:1rem;
    border-radius: 5px;

    .upper-area {
        display: flex;
        box-sizing: border-box;
        padding: 10px 15px;

        .left-side {
            flex-grow: 1;
            display: flex;

            .title-area {
                margin-right: 10px;
            }
        }

        .right-side {
            .icon-area {
                width: 50px;
                height: 50px;
            }
        }
    }

    .lower-area {
        display: flex;
        box-sizing: border-box;
        padding: 10px 15px;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
        height: 60px;
        align-items: center;

        .left-side {
          width: 35%;

            .attendance-progress {
              width: 90%;
              margin-top: 1.5rem;
            }
        }

        .right-side {
          width: 65%;
        }
    }

}

.light-mode {
    .task-info-container {
        background-color: white;
        border: 1px solid rgba(0, 0, 0, 0.25);
            box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);

        .lower-area {
            background-color: #E3EBF2;
        }
    }
}

.dark-mode {
    // 282c36
    .task-info-container {
        background-color: #282c36;

        .lower-area {
            background-color: #313440;
        }
    }
}
</style>