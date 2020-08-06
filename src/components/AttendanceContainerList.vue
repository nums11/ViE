<template>
  <div>
    <div class="input-wrapper" v-for="attendance in attendance_list">
      <div style="border:black solid; margin:auto; margin-top:1rem;width:70%; height: 5rem; border-radius:5px; display: inline-block;" >
        <p>Start: {{new Date(attendance.qr_checkin_start_time)}}</p>
        <p>End: {{new Date(attendance.qr_checkin_end_time)}}</p>
      </div>
      <h1 @click="$emit('remove-attendance',attendance)" style="display:inline-block; cursor: pointer;"> X</h1>
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
    attendance_list: Array
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