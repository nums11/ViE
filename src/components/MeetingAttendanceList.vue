<template>
  <div class="task-info-modal-instructor-expanded task-attendance-info-mode">
    <div class="header-area">
      <div class="left-side">
        <div class="title-area">
          <h4 class="sub-text">Attendees who submitted to at least one task are considered present</h4>
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
        <h3>Present ({{present_attendees.length}}/{{attendees.length}})</h3>
        <div class="attendee-list">
          <p v-for="attendee in present_attendees">
            {{ attendee.first_name }} {{ attendee.last_name }} ({{ attendee.user_id }})
          </p>
        </div>
      </div>
      <div class="inline-block student-attendance-list-container">
        <h3>Absent ({{absent_attendees.length}}/{{attendees.length}})</h3>
        <div class="attendee-list">
          <p v-for="attendee in absent_attendees">
            {{ attendee.first_name }} {{ attendee.last_name }} ({{ attendee.user_id }})
          </p>
        </div>
        </sui-label>
      </div>
    </div>

    <!-- Footer Area -->
    <div class="footer-area">
      <div class="left-side">
<!--         <sui-button 
          compact icon="left arrow" 
          label-position="left" 
          @click="cancelTask"
          content="Back" /> -->
      </div>
      <div class="center-area">
        <!-- <ProgressBar :value="0.8" /> -->
      </div>
      <div class="right-side">
          <!-- RIGHT FOOTER PLACEHOLDER -->
      </div>
    </div>
  </div>
</template>

<script>

import ProgressBar from "@/components/ProgressBar.vue";

export default {
    name: 'TaskAttendanceList',
    components: {
      ProgressBar
    },
    props: {
      meeting: {
        type: Object,
        required: true
      },
      attendees: {
        type: Array,
        required: true
      }
    },
    data() {
      return {
        present_attendees: [],
        absent_attendees: []
      }
    },
    created() {
      this.separateAttendees()
    },
    methods: {
      separateAttendees() {
        let submission_ids = this.getSubmissionIds()
        this.attendees.forEach(attendee => {
          if(submission_ids.has(attendee.user_id))
            this.present_attendees.push(attendee)
          else
            this.absent_attendees.push(attendee)
        })
        this.present_attendees.sort((a,b) => (a.user_id > b.user_id) ? 1 : -1)
        this.absent_attendees.sort((a,b) => (a.user_id > b.user_id) ? 1 : -1)
      },
      getSubmissionIds() {
        let submission_ids = new Set()
        this.meeting.real_time_portion.qr_scans.forEach(qr_scan => {
          let submissions = qr_scan.submissions
          submissions.forEach(submission => {
            submission_ids.add(submission.submitter.user_id)
          })
        })
        this.meeting.async_portion.videos.forEach(video => {
          let submissions = video.video_submissions
          submissions.forEach(submission => {
            submission_ids.add(submission.submitter.user_id)
          })
        })
        return submission_ids
      }
    }
}
</script>
<style lang="scss" scoped>

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
              width: 100%;
              margin-right: 10px;
            }
        }
    }

    .body-area {
      margin-top: 1rem;
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

.sub-text {
  text-align: center;
  font-weight: bold;
  color: #595757;
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