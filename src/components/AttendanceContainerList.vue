<template>
  <div>
    <div class="input-wrapper" v-for="attendance in attendance_list">
      <div v-if="is_qr" style="border:black solid; margin:auto; margin-top:1rem;width:70%; height: 6rem; border-radius:5px; display: inline-block;" >
        <h3>QR</h3>
        <p>Start: {{new Date(attendance.qr_checkin_start_time)}}</p>
        <p>End: {{new Date(attendance.qr_checkin_end_time)}}</p>
      </div>
      <div v-else style="border:black solid; margin:auto; margin-top:1rem;width:70%; height: 6rem; border-radius:5px; display: inline-block;">
        <h3>Recording</h3>
        <p>Submission Start: {{new Date(attendance.recording_submission_start_time)}}</p>
        <p>Submission End: {{new Date(attendance.recording_submission_end_time)}}</p>
      </div>
      <h1 @click="$emit('remove-attendance',attendance, is_qr)" style="display:inline-block; cursor: pointer;"> X</h1>
    </div>
  </div>
</template>

<script>
import LectureAPI from "@/services/LectureAPI.js";
import CourseAPI from "@/services/CourseAPI.js";
import MeetingAPI from "@/services/MeetingAPI.js";
import OrgAPI from "@/services/OrgAPI.js";
import SectionAPI from "@/services/SectionAPI.js";
import Sections from "@/components/Sections";
import QRCode from "qrcode";
import GoogleMap from "@/components/GoogleMap";
import LectureUploadModal from "@/components/LectureUploadModal";
import flatpickr from "flatpickr";
import '../../node_modules/flatpickr/dist/flatpickr.min.css';
require("flatpickr/dist/themes/material_blue.css");

export default {
  name: "AttendanceContainerList",
  data() {
    return {
    }
  },
  props: {
    attendance_list: Array,
    is_qr: {
      type: Boolean,
      default: true
    }
  },
  created() {
  },
  computed: {

  },
  methods: {

  }
};
</script>

<style>

</style>