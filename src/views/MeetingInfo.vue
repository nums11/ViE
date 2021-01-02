<template>
  <div id="meeting-info">
    <FullScreenQRCodeModal v-if="show_qr_code_modal"
      v-on:hide-modal="hideFullScreenQRCodeModal"
      :code="full_screen_code" 
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
      <div v-if="is_instructor">
        <div v-if="real_time_portion_status === 'pending'">
          <h2>Real Time Portion Pending</h2>
        </div>
        <div v-else-if="real_time_portion_status === 'open'">
          <h2>Real Time Portion Open</h2>
          <button
          v-for="qr_scan in meeting.real_time_portion.qr_scans"
          :key="qr_scan._id"
          @click="showFullScreenQRCodeModal(qr_scan.code)">
            Show QR Code
          </button>
        </div>
        <div v-else>
          <h2>Real Time Portion Closed</h2>
        </div>
      </div>
      <div v-else>
        
      </div>
    </div>
  </div>
</template>

<script>
import MeetingAPI from '@/services/MeetingAPI'
import moment from 'moment'
import FullScreenQRCodeModal from '@/components/FullScreenQRCodeModal.vue';

export default {
  name: 'MeetingInfo',
  components: {
    FullScreenQRCodeModal
  },
  data () {
    return {
      meeting: {},
      meeting_course: {},
      meeting_has_loaded: false,
      real_time_portion_status: null,
      show_qr_code_modal: false,
      full_screen_code: null
    }
  },
  async created () {
    await this.getMeeting()
    this.getRealTimePortionStatus()
  },
  methods: {
    async getMeeting() {
      try {
        this.meeting_id = this.$route.params.meeting_id
        const response = await MeetingAPI.getMeeting(this.meeting_id)
        this.meeting = response.data
        this.meeting_course = this.meeting.sections[0].course
        this.meeting_has_loaded = true
      } catch(error) {
        console.log(error)
        alert("Sorry something went wrong")
      }
    },
    getRealTimePortionStatus() {
      const current_time = new Date()
      if(moment(current_time).isBefore(this.meeting.real_time_portion.real_time_start))
        this.real_time_portion_status = "pending"
      else if(moment(current_time).isAfter(this.meeting.real_time_portion.real_time_end))
        this.real_time_portion_status = "closed"
      else
        this.real_time_portion_status = "open"
    },
    showFullScreenQRCodeModal(code) {
      this.full_screen_code = code
      this.show_qr_code_modal = true
    },
    hideFullScreenQRCodeModal() {
      this.show_qr_code_modal = false
      this.full_screen_code = null
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
</style>