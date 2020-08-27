<template>
  <div class="task-info-modal-instructor-expanded task-attendance-info-mode">
    <div class="header-area">
      <div class="left-side">
        <div class="title-area">
          <h4 v-if="is_qr">QR Submission</h4>
          <h4 v-else>Recording</h4>
        </div>
      </div>
      <div class="right-side">
        <div class="icon-area">
          <!-- SPACE AVAILABLE -->
        </div>
      </div>
    </div>

    <!-- Body Area -->
    <div class="body-area">
      <div class="inline-block student-attendance-list-container">
        <h3>Present ({{present_attendees.size}}/{{attendees.length}})</h3>
        <p v-for="(attendee_id,i) in Array.from(present_attendees)" :key="i">
          {{ students[attendee_id].first_name }} {{ students[attendee_id].last_name }} ({{ students[attendee_id].user_id }})
          <span v-if="!is_qr">- {{ video_percentages[i].toFixed(0) }}%</span>
        </p>
      </div>
      <div class="inline-block student-attendance-list-container">
        <h3>Absent ({{absent_attendees.size}}/{{attendees.length}})</h3>
        <p v-for="(attendee_id, i) in Array.from(absent_attendees)" :key="i">
          {{ students[attendee_id].first_name }} {{ students[attendee_id].last_name }} ({{ students[attendee_id].user_id }})
        </p>
      </div>
    </div>

    <!-- Footer Area -->
    <div class="footer-area">
      <div class="left-side">
        <sui-button 
          compact icon="left arrow" 
          label-position="left" 
          @click="cancelTask"
          content="Back" />
      </div>
      <div class="center-area">
        <ProgressBar :value="present_attendees.size/attendees.length" />
      </div>
      <div class="right-side">
          <!-- RIGHT FOOTER PLACEHOLDER -->
      </div>
    </div>
  </div>
</template>

<script>

import ProgressBar from "@/components/ProgressBar.vue";
import io from 'socket.io-client';

export default {
    name: 'TaskAttendanceList',
    components: {
      ProgressBar
    },
    props: {
      task: {
        type: Object,
        required: true
      },
      attendees: {
        type: Array,
        required: true
      },
      cancelTask: {
        type: Function,
        required: true
      }
    },
    data() {
      return {
        is_qr: false,
        present_attendees: new Set(),
        absent_attendees: new Set(),
        students: {},
        video_percentages: []
      }
    },
    created() {
      this.is_qr = this.task.code != null
      this.separateAttendees()
      this.initializeAttendanceRealTimeUpdate ()
      console.log("video_percentages", this.video_percentages)
    },
    methods: {
      initializeAttendanceRealTimeUpdate () {
            
          console.log(`initializing socket`)
          let client_io = io ('https://byakugan.herokuapp.com/', {forceNew: true})
          client_io.emit('start attendance update', {
              task_id: this.task._id,
              type: this.is_qr ? 'qr-code': 'unhandled type',
          })
          client_io.on('attendance update', (data) => {
              console.log(`SOCKET UPDATED`)
              console.log(data)
              // the data should be an array of User objects
              data.data.forEach(user => {
                  this.present_attendees.add(user._id)
                  this.absent_attendees.delete(user._id)
              })
              this.$forceUpdate ()
          })
      },
      separateAttendees() {
        let submission_ids = this.getSubmissionIds()
        this.attendees.forEach(attendee => {

          this.students[attendee._id] = attendee

          if(submission_ids.has(attendee.user_id))
            this.present_attendees.add(attendee._id)
          else
            this.absent_attendees.add(attendee._id)
        })
        console.log("Present", this.present_attendees)
        console.log("Absent", this.absent_attendees)
      },
      getSubmissionIds() {
        let task_submissions = this.is_qr ? 
        this.task.qr_checkin_submissions :
        this.task.recording_submissions
        let submission_ids = new Set()
        task_submissions.forEach(submission => {
          submission_ids.add(submission.submitter.user_id)
          if(!this.is_qr)
            this.video_percentages.push(submission.video_percent_watched)
        })
        return submission_ids
      }
    }
}
</script>
<style lang="scss">

.task-attendance-info-mode {
    
  .student-attendance-list-container {
    width: 50%;
    vertical-align: top;
    text-align: center;
  }

}

.task-info-modal-instructor-expanded {
    border-radius: 3px;
    margin-bottom: 30px;

    .header-area {
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
    }

    .body-area {
      margin-top: 1rem;
      min-height: 450px;
      box-sizing: border-box;
      padding: 10px 15px;

      .body-contents {
          text-align: center;
      }
    }

    .footer-area {
        box-sizing: border-box;
        padding: 10px 15px;
        display: flex;
        align-items: center;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;

        .center-area {
            flex-grow: 1;
            text-align: center;
        }
    }

}

.light-mode {
    .task-info-modal-instructor-expanded {
        background-color: white;
        border: 1px solid rgba(0, 0, 0, 0.25);
            box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);

        .footer-area {
            background-color: #E3EBF2;
        }
    }
}

.dark-mode {
    // 282c36
    .task-info-modal-instructor-expanded {
        background-color: #282c36;

        .footer-area {
            background-color: #313440;
        }
    }
}

</style>