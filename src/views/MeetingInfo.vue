<template>
  <div id="meeting-info">
    <QRScanningWindow v-if="show_qr_scanning_window"
    v-on:hide-window="hideQRScanningWindow"
    v-on:attempt-submission="attemptQRScanSubmission"/>
    <FullScreenQRCodeModal v-if="show_qr_code_modal"
      v-on:hide-modal="hideFullScreenQRCodeModal"
      :qr_scan="full_screen_qr_scan"
      :student_ids="meeting_student_ids"
    />

    <div v-if="!meeting_has_loaded">Loading...</div>
    <div v-else>
      <h2>{{ meeting.title }}</h2>
      <h4>{{ meeting_course.dept }} {{ meeting_course.course_number }}</h4>
      <h4>Section(s) 
        <span v-for="section in meeting.sections" :key="section._id">
          {{ section.section_number }}
        </span>
      </h4>
      <h5>{{ meeting_course.instructor.first_name }} 
      {{ meeting_course.instructor.last_name }}</h5>
      <div v-if="meeting.real_time_portion != null">
        <h2 v-if="real_time_portion_status === 'pending'">Real Time Portion Pending</h2>
        <h2 v-else-if="real_time_portion_status === 'open'">Real Time Portion Open</h2>
        <h2 v-else>Real Time Portion Closed</h2>
        <h3>
          Real-Time Start: {{ new Date(meeting.real_time_portion.real_time_start) }}
        </h3>
        <h3>
          Real-Time End: {{ new Date(meeting.real_time_portion.real_time_end) }}
        </h3>
      </div>

      <div v-if="is_instructor">
        <div v-if="meeting.real_time_portion != null">
          <div v-for="qr_scan in meeting.real_time_portion.qr_scans"
          :key="qr_scan._id" class="qr-scan-container">
            <button
            v-if="real_time_portion_status === 'open'"
            @click="showFullScreenQRCodeModal(qr_scan)">
              Show QR Code
            </button>
            <h2>Submissions</h2>
            <ul>
              <li v-for="submission in qr_scan.submissions">
                {{ submission.submitter.first_name }} 
                {{ submission.submitter.last_name }} 
                {{ submission.submitter.user_id }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div v-else>
        <button @click="showQRScanningWindow">Scan QR</button>
        <div v-if="meeting.real_time_portion != null">
          <div v-for="qr_scan in meeting.real_time_portion.qr_scans"
          :key="qr_scan._id">
            <!-- Todo: Don't show students scans that have not yet been opened -->
            <div class="qr-scan-container">
              <p v-if="studentSubmittedToQRScan(state_user.user_id,qr_scan)">
                Submission recorded
              </p>
              <p v-else>No Submission</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import MeetingAPI from '@/services/MeetingAPI'
import FullScreenQRCodeModal from '@/components/FullScreenQRCodeModal.vue';
import QRScanningWindow from '@/components/QRScanningWindow.vue';
import helpers from '@/helpers.js'

export default {
  name: 'MeetingInfo',
  mixins: [helpers],
  components: {
    FullScreenQRCodeModal,
    QRScanningWindow
  },
  data () {
    return {
      meeting: {},
      meeting_course: {},
      meeting_student_ids: [],
      meeting_has_loaded: false,
      real_time_portion_status: null,
      show_qr_code_modal: false,
      full_screen_qr_scan: null,
      show_qr_scanning_window: false
    }
  },
  async created () {
    await this.getMeeting()
    if(this.meeting.real_time_portion != null) {
      this.real_time_portion_status = 
        this.getRealTimePortionStatus(this.meeting.
          real_time_portion)
    }
  },
  methods: {
    async getMeeting() {
      try {
        this.meeting_id = this.$route.params.meeting_id
        const response = await MeetingAPI.getMeeting(this.meeting_id)
        this.meeting = response.data
        console.log("Meeting", this.meeting)
        this.meeting_course = this.meeting.sections[0].course
        this.meeting_student_ids = this.getMeetingStudentIDs(this.meeting)
        this.meeting_has_loaded = true
      } catch(error) {
        console.log(error)
        alert("Sorry something went wrong")
      }
    },
    showFullScreenQRCodeModal(qr_scan) {
      this.full_screen_qr_scan = qr_scan
      this.show_qr_code_modal = true
    },
    hideFullScreenQRCodeModal() {
      this.show_qr_code_modal = false
      this.full_screen_qr_scan = null
    },
    showQRScanningWindow() {
      this.show_qr_scanning_window = true
    },
    hideQRScanningWindow() {
      this.show_qr_scanning_window = false
    },
    attemptQRScanSubmission(url) {
      window.location.href = url
    }
  }
}
</script>

<style scoped>
#meeting-info {
  text-align: center;
  width: 80%;
  margin: auto;
  margin-top: 2rem;
}

.qr-scan-container {
  border: black solid;
}
</style>