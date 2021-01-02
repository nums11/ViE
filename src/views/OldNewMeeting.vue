<template>
  <div>
    <div v-if="notification_permission_status === 'default' && real_time_portion != null"
    class="notification-message">You currently do not have notifications enabled for Venue, so you will not be able to receive a notification for any QR Codes that become available. To enable notifications click <span @click="requestNotificationPermission">here</span>.</div>
    <div v-else-if="notification_permission_status === 'blocked' && real_time_portion != null"
    class="notification-message">You currently have notifications blocked for Venue, so you will not be able to receive a notification for any QR Codes that become available. To enable notifications click on the icon in the top left of your search bar and set notifications to "Allow".</div>
    <div class="new-meeting-form">
      <div class="form-center">
        <div class="left-side-area">
          <div class="logo-area"></div>
          <div class="tasks-list">
            <div class="section-header">LIVE TASKS</div>
            <div class="empty-area">No real_time tasks</div>
          </div>
          <div class="tasks-list">
            <div class="section-header">ASYNCHRONOUS TASKS</div>
            <div class="empty-area">No asynchronous tasks</div>
          </div>
        </div>

        <div class="right-side-area"> 
          <div class="new-meeting-title">
            <div class="label">NEW MEETING</div>
            <h3>{{ course.name }}</h3>
          </div>
          <div class="meeting-name">
            <InputField2
              v-model="meeting_title"
              :validate="{
                mustBeFilled: (x) => [x.length > 0, 'Field cannot be left empty.']
              }"
              :config="{
                label: 'Meeting Name',
                icon: 'users',
                width: '60%'
              }"
            />
            <div class="info-area">
              Enter the name for your meeting.
            </div>
          </div>

          <div class="section-selectors">
            <h5>Select the sections for your meeting</h5>
            <div v-for="section in course.sections" :key="section._id" 
            @click="selectSection(section)" class="section-selector"
            :id="`section${section.section_number}`">
              Section {{ section.section_number }}
            </div>
          </div>

          <div class="real_time-meeting-portion">
            <div>
              <div class="checkbox">
                <input type="checkbox" v-model="show_real_time_inputs" />
                <label>Add real-time tasks</label>
              </div>
            </div>
            <transition name="fade" mode="out-in">
              <div v-if="show_real_time_inputs">

                <div class="meeting-time-picker-area" :style="{width: '60%'}">
                  <h4 style="margin-top:1rem;">Meeting Times</h4>
                  <div class="info-area">
                    Choose the start and end times for the real-time portion of your meeting.
                  </div>
                  <div class="date-label">START TIME</div>
                  <input type="datetime-local" v-model="real_time_portion.real_time_start" />
                  <div class="date-label">End TIME</div>
                  <input type="datetime-local" v-model="real_time_portion.real_time_end" />

                  <div style="margin-top:2rem;">
                    <p>Num QR Scans: {{ num_qr_scans }}</p>
                    <button @click="addQR">Add QR Scan</button>
                  </div>

           <!--        <input class="new-meeting-datetime-picker" placeholder="Select date & time"
                  id="real_time_start" aria-labelledby="start_time_label" type="datetime-local"/>
                  <div class="date-label" :style="{marginTop: '20px'}">END TIME</div>
                  <input class="new-meeting-datetime-picker" placeholder="Select date & time"
                  id="real_time_end" aria-labelledby="end_time_label" type="datetime-local"
                  :disabled="disable_real_time_end_input"/> -->
                </div>

<!--                 <div class="meeting-time-picker-area" :style="{width: '60%', marginTop: '30px'}">
                  <h4>QR Checkin Times</h4>
                  <div class="info-area" >
                    Choose the time window for which students will be able to scan a QR code for
                    attendance during the real_time portion of your meeting. You will receive a notification to
                    show the QR Code to your students at the start time.
                  </div>
                  <div class="date-label">START TIME</div>
                  <input class="new-meeting-datetime-picker" placeholder="Select date & time"
                  id="qr_scan_start" aria-labelledby="qr_start_time_label" type="datetime-local"
                  :disabled="!meetingHasStartAndEndTime"/>
                  <div class="date-label" :style="{marginTop: '20px'}">END TIME</div>
                  <input class="new-meeting-datetime-picker" placeholder="Select date & time"
                  id="qr_scan_end" aria-labelledby="qr_end_time_label" type="datetime-local"
                  :disabled="!meetingHasStartAndEndTime || !qrCheckinHasStartTime"/>
                </div> -->

              </div>
            </transition>
          </div>

          <div class="real_time-meeting-portion">
            <div>
              <div class="checkbox">
                <input type="checkbox" @click="toggleAsyncInputs" />
                <label>Add asynchronous tasks</label>
              </div>
            </div>
            <transition name="fade" mode="out-in">
              <div v-if="async_portion != null">
                <div class="meeting-time-picker-area" :style="{width: '60%'}">
                  <h4 style="margin-top:1rem;">Video Video</h4>
                  <div class="info-area">
                    Choose the time window for which your students are allowed to watch
                    the video for attendance. The video will become available for student viewing
                    at the beginning of the time window and will remain available after the end of the
                    time window, however, afterward students will not be able to watch for attendance.
                  </div>
                  <div :class="`video-upload-holder ${video.video != null ? 'active' : ''}`" @click="showFileSelector">
                    <div v-if="video.video == null">
                      <p>Click to add a video</p>
                      <p class="small">File format (.mp4, .wav, etc?)</p>
                    </div>
                    <div v-else>{{ video.video.name }}</div>
                    <input type="file" id="video-upload-input" @change="setVideoFile" />
                  </div>
                  <div v-if="video.video != null" class="clear" @click="clearVideoUpload">clear</div>
                  <div class="date-label" style="margin-top:2rem;">START TIME</div>
                  <input class="new-meeting-datetime-picker" placeholder="Select date & time"
                  id="video_submission_start" aria-labelledby="video_submission_start_time" type="datetime-local" />
                  <div class="date-label" :style="{marginTop: '20px'}">END TIME</div>
                  <input class="new-meeting-datetime-picker" placeholder="Select date & time"
                  id="video_submission_end" aria-labelledby="video_submission_end_time" type="datetime-local"
                  :disabled="!videoHasStartTime" />
                </div>
              </div>
            </transition>
          </div>

          <div class="real_time-meeting-portion">
<!--             <Button2 
              :style="{marginBottom: '20px', marginRight: '2%'}"
              :onClick="cancelForm"
              :config="{
                width: '8%',
                iconOnly: true,
                icon: 'arrow left',
                color: 'venue-grey'
              }" />
            <Button2 
              :style="{marginBottom: '20px'}"
              text="Create New Meeting"
              :disabled="!meetingCanBeCreated"
              :onClick="createMeeting"
              :config="{
                width: '50%',
                icon: 'right arrow',
                iconSide: 'right'
              }" /> -->
            <button @click="createMeeting">Create Meeting</button>
          </div>
        </div>
      </div>

      <div v-if="meeting_saving" class="submission-fullscreen">
        <div class="centerer">
          <v-lottie-player 
            name="QR CODE"
            :animationData="require('@/assets/lottie/uploading.json')"
            loop
            width="300px"
            height="300px"
            autoplay
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import moment from 'moment'
import InputField2 from '@/components/InputField2.vue'
import Button2 from '@/components/Button2.vue'
import MeetingAPI from '@/services/MeetingAPI'
import CourseAPI from '@/services/CourseAPI'
import NotificationAPI from '@/services/NotificationAPI'
import {NewMeetingTransform} from '@/modules/MeetingTransform.module'
import VueLottiePlayer from 'vue-lottie-player'
import flatpickr from "flatpickr";
import 'flatpickr/dist/themes/material_blue.css';
import UserAPI from '@/services/UserAPI';

export default {
  name: 'NewMeeting',
  components: {
    InputField2,
    Button2,
    vLottiePlayer: VueLottiePlayer
  },
  data () {
    return {
      meeting_title: "",
      sections: [],
      real_time_portion: {
        real_time_start: null,
        real_time_end: null,
        qr_scans: []
      },
      num_qr_scans: 0,
      scheduled_qr_time: null,
      scheduled_qr_times: [],
      show_real_time_inputs: false,
      show_qr_scan_inputs: false,
      // TODO: Remove these and use the arrays to
      // allow for multiple qr checkins and videos
      qr_scan: {
        qr_scan_start_time: null,
        qr_scan_end_time: null
      },
      video: {
        video: null,
        video_submission_start_time: null,
        video_submission_end_time: null
      },
      qr_scans: [],
      videos: [],
      for_course: false,
      meeting_saving: false,
      course: {},
      start_time_picker: null,
      end_time_picker: null,
      qr_start_time_picker: null,
      qr_end_time_picker: null,
      video_start_time_picker: null,
      video_end_time_picker: null,
      notification_permission_status: "",
      disable_real_time_end_input: true
    }
  },
  computed: {
    meetingHasRealTimeStart() {
      console.log("start", this.meeting.real_time_portion.real_time_start)
      return this.meeting.real_time_portion != null
    },
    meetingHasStartAndEndTime() {
      return this.meeting.real_time_portion.real_time_start != null && this.meeting.real_time_portion.real_time_end != null
    },
    qrCheckinHasStartTime() {
      return this.qr_scan.qr_scan_start_time != null
    },
    videoHasStartTime() {
      return this.video.video_submission_start_time != null
    },
    meetingCanBeCreated() {
      if(this.meeting.title === "") return false;
      if(this.meeting.sections.length === 0) return false;
      if(!(this.meeting.has_real_time_portion || this.meeting.has_async_portion))
        return false
      if(this.meeting.has_real_time_portion){
        if(this.meeting.real_time_portion.real_time_start == null ||
          this.meeting.real_time_portion.real_time_end == null ||
          this.qr_scan.qr_scan_start_time == null ||
          this.qr_scan.qr_scan_end_time == null)
          return false
      }
      if(this.meeting.has_async_portion){
        if(this.video.video_submission_start_time == null ||
          this.video.video_submission_end_time == null)
          return false
      }
      return true
    }
  },
  created () {
    this.getNotificationPermissionStatus()
    this.getCourseOrOrg()
  },
  methods: {
    showQRScanInputs() {
      this.show_qr_scan_inputs = true
    },
    addQR() {
      this.num_qr_scans++
    },
    getNotificationPermissionStatus() {
      if(Notification.permission === "default")
        this.notification_permission_status = "default"
      else if(Notification.permission === "granted")
        this.notification_permission_status = "granted"
      else
        this.notification_permission_status = "blocked"
    },
    async getCourseOrOrg() {
      this.course_id = this.$route.params.course_id;
      const response = await CourseAPI.getCourse(this.course_id)
      this.course = response.data
    },
    toggleRealTimeInputs() {
      this.show_real_time_inputs = !this.show_real_time_inputs
      if(this.show_real_time_inputs){
        this.meeting.real_time_portion = {}
        this.initRealTimeDateInputs()
      }
      else
        this.resetRealTimeDateInputs()
    },
    toggleAsyncInputs() {
      this.meeting.has_async_portion = !this.meeting.has_async_portion
      if(this.meeting.has_async_portion)
        this.initAsyncDateInputs()
      else
        this.resetAsyncDateInputs()
    },
    initRealTimeDateInputs() {
      this.$nextTick(() => {
        this.initRealTimeStartInput(this)
        this.initRealTimeEndInput(this)
        this.initQRScanStartInput(this)
        this.initQRScanEndInput(this)
      })
    },
    initAsyncDateInputs() {
      this.$nextTick(() => {
        this.initVideoSubmissionStartInput(this)
        this.initVideoSubmissionEndInput(this)
      })
    },
    initRealTimeStartInput(self) {
      self.start_time_picker = flatpickr(document.getElementById("real_time_start"),{
        enableTime: true,
        dateFormat: "M d Y, h:i K",
        minDate: Date.now(),
        minuteIncrement: 1,
        onChange: function(selectedDates, dateStr, instance) {
          self.meeting.real_time_portion.real_time_start = Date.parse(dateStr)
          self.disable_real_time_end_input = false
          // Set the new min end time to 15 minutes after the new start time
          let new_min_end_time = new Date(self.meeting.real_time_portion.real_time_start)
          new_min_end_time.setMinutes(new_min_end_time.getMinutes() + 15)
          self.end_time_picker.set("minDate",new_min_end_time)
          // Update meeting end time if invalid
          let fifteen_mins = 60 * 15 * 1000
          if(self.meeting.real_time_portion.real_time_start > self.meeting.real_time_portion.real_time_end ||
            self.meeting.real_time_portion.real_time_end == null) {
            self.meeting.real_time_portion.real_time_end = self.meeting.real_time_portion.real_time_start + fifteen_mins
            self.end_time_picker.setDate(self.meeting.real_time_portion.real_time_start + fifteen_mins)
          }
          // Keep the start and end time 15 minutes apart
          if((self.meeting.real_time_portion.real_time_start + fifteen_mins) > self.meeting.real_time_portion.real_time_end) {
            self.meeting.real_time_portion.real_time_end = self.meeting.real_time_portion.real_time_start + fifteen_mins
            self.end_time_picker.setDate(self.meeting.real_time_portion.real_time_start + fifteen_mins)
          }
          self.$forceUpdate()
          self.clearQRDateInputs(self)
        }
      })
    },
    initRealTimeEndInput(self) {
      self.end_time_picker = flatpickr(document.getElementById("real_time_end"),{
        enableTime: true,
        dateFormat: "M d Y, h:i K",
        minDate: Date.now(),
        minuteIncrement: 1,
        onChange: function(selectedDates, dateStr, instance) {
          self.meeting.real_time_portion.real_time_end = Date.parse(dateStr)
          self.clearQRDateInputs(self)
        }
      })
    },
    // QR Checkin start time and end time have to be at least 5 minutes apart
    // and there should also 
    initQRScanStartInput(self) {
      self.qr_start_time_picker = flatpickr(document.getElementById("qr_scan_start"),{
        enableTime: true,
        dateFormat: "M d Y, h:i K",
        minDate: Date.now(),
        minuteIncrement: 1,
        onChange: function(selectedDates, dateStr, instance) {
          self.qr_scan.qr_scan_start_time = Date.parse(dateStr)
          // Set the new min qr end time to 5 minutes after the new start time
          let new_min_qr_end_time = new Date(self.qr_scan.qr_scan_start_time)
          new_min_qr_end_time.setMinutes(new_min_qr_end_time.getMinutes() + 5)
          self.qr_end_time_picker.set("minDate",new_min_qr_end_time)
          // Update qr end time if invalid
          let five_mins = 60 * 5 * 1000
          if(self.qr_scan.qr_scan_start_time > self.qr_scan.qr_scan_end_time
            || self.qr_scan.qr_scan_end_time == null) {
            self.qr_scan.qr_scan_end_time = self.qr_scan.qr_scan_start_time + five_mins
            self.qr_end_time_picker.setDate(self.qr_scan.qr_scan_start_time + five_mins)
          }
          // Keep the qr start and end time 5 minutes apart
          if((self.qr_scan.qr_scan_start_time + five_mins) > self.qr_scan.qr_scan_end_time) {
            self.qr_scan.qr_scan_end_time = self.qr_scan.qr_scan_start_time + five_mins
            self.qr_end_time_picker.setDate(self.qr_scan.qr_scan_start_time + five_mins)
          }
        }
      })
    },
    initQRScanEndInput(self) {
      self.qr_end_time_picker = flatpickr(document.getElementById("qr_scan_end"),{
        enableTime: true,
        dateFormat: "M d Y, h:i K",
        minDate: Date.now(),
        minuteIncrement: 1,
        onChange: function(selectedDates, dateStr, instance) {
          self.qr_scan.qr_scan_end_time = Date.parse(dateStr)
        }
      })
    },
    initVideoSubmissionStartInput(self) {
      self.video_start_time_picker = flatpickr(document.getElementById("video_submission_start"),{
        enableTime: true,
        dateFormat: "M d Y, h:i K",
        minDate: Date.now(),
        minuteIncrement: 1,
        onChange: function(selectedDates, dateStr, instance) {
          self.video.video_submission_start_time = Date.parse(dateStr)
          // Set the new min end time to 15 minutes after the new start time
          let new_min_video_end_time = new Date(self.video.video_submission_start_time)
          new_min_video_end_time.setMinutes(new_min_video_end_time.getMinutes() + 15)
          self.video_end_time_picker.set("minDate",new_min_video_end_time)
          // Update meeting end time if invalid
          let fifteen_mins = 60 * 15 * 1000
          if(self.video.video_submission_start_time > self.video.video_submission_end_time ||
            self.video.video_submission_end_time == null) {
            self.video.video_submission_end_time = self.video.video_submission_start_time + fifteen_mins
            self.video_end_time_picker.setDate(self.video.video_submission_start_time + fifteen_mins)
          }
          // Keep the start and end time 15 minutes apart
          if((self.video.video_submission_start_time + fifteen_mins) > self.video.video_submission_end_time) {
            self.video.video_submission_end_time = self.video.video_submission_start_time + fifteen_mins
            self.video_end_time_picker.setDate(self.video.video_submission_start_time + fifteen_mins)
          }
        }
      })
    },
    initVideoSubmissionEndInput(self) {
      self.video_end_time_picker = flatpickr(document.getElementById("video_submission_end"),{
        enableTime: true,
        dateFormat: "M d Y, h:i K",
        minDate: Date.now(),
        minuteIncrement: 1,
        onChange: function(selectedDates, dateStr, instance) {
          self.video.video_submission_end_time = Date.parse(dateStr)
        }
      })
    },
    resetRealTimeDateInputs() {
      this.start_time_picker = null
      this.end_time_picker = null
      this.qr_start_time_picker = null
      this.qr_end_time_picker = null
      this.meeting.real_time_portion = null
      this.meeting.real_time_portion.real_time_start = null
      this.meeting.real_time_portion.real_time_end = null
      this.disable_real_time_end_input = true
      this.qr_scan.qr_scan_start_time = null
      this.qr_scan.qr_scan_end_time = null
    },
    resetAsyncDateInputs() {
      this.video_start_time_picker = null
      this.video_end_time_picker = null
      this.video.video_submission_start_time = null
      this.video.video_submission_end_time = null
    },
    clearQRDateInputs(self) {
      self.qr_start_time_picker.set("minDate",self.meeting.real_time_portion.real_time_start)
      self.qr_start_time_picker.set("maxDate", self.meeting.real_time_portion.real_time_end)
      self.qr_scan.qr_scan_start_time = null
      self.qr_start_time_picker.setDate(null)
      self.qr_end_time_picker.set("minDate",self.meeting.real_time_portion.real_time_start)
      self.qr_end_time_picker.set("maxDate", self.meeting.real_time_portion.real_time_end)
      self.qr_scan.qr_scan_end_time = null
      self.qr_end_time_picker.setDate(null)
    },
    cancelForm () {
      if(this.$route.name === 'course_new_meeting')
        this.$router.push({name: 'course_info', params: {id: this.$route.params.course_id}})
      else
        this.$router.push({name: 'org_info', params: {id: this.$route.params.org_id}})
    },
   showFileSelector () {
     document.getElementById("video-upload-input").click()
   },
   setVideoFile (e) {
    // todo check if valid file extension
    this.video.video = e.target.files[0]
   },
   clearVideoUpload () {
     this.video.video = null
   },
   qrCheckinHasStartAndEndTime() {
     return this.qr_scan.qr_scan_start_time != null
   },
    // Todo: Revert this allowing for multiple qr_scans and videos
   async createMeeting() {
    // let confirmation = confirm(this.getConfirmationString())
    // if(confirmation){
      this.meeting_saving = true
      for(let i = 0; i < this.num_qr_scans; i++) {
        this.real_time_portion.qr_scans.push({
          code: this.generateRandomCode()
        })
      }
      try {
        const real_time_portion = null, async_portion = null
        if(this.real_time_portion.qr_scans.length !== 0 ||
          this.real_time_portion.quizzes.length !== 0) {
          real_time_portion = this.real_time_portion
        }
        if(this.async_portion.recordings.length !== 0 ||
          this.async_portion.quizzes.length !== 0) {
          async_portion = this.async_portion
        }
        console.log("Meeting Title", this.meeting_title)
        console.log("Sections", this.sections)
        console.log("real_time_portion", this.real_time_portion)
        console.log("async_portion", this.async_portion)
        await MeetingAPI.addMeeting(this.meeting_title, this.sections,
          real_time_portion, async_portion)
      } catch(error) {
        console.log("Error", error)
        alert("Sorry, something went wrong saving your meeting")
      }
      console.log("Scans", this.real_time_portion)
      // if(this.meeting.has_real_time_portion) {
      //   this.qr_scan.code = this.generateRandomCode()
      //   this.meeting.qr_scans = [this.qr_scan]
      // }
      // if(this.meeting.has_async_portion) 
      //  await this.saveVideoVideoToGCS()
      // let meeting = await this.saveMeetingToCourseOrOrg()
      // this.meeting_saving = false
      // if(meeting != null){
      //   if(meeting.has_real_time_portion )
      //     this.scheduleShowQRNotificationsForInstructors(meeting)
      //   this.$router.push({name: 'meeting_info', params: {meeting_id: meeting._id}})
      // }
      // else
      //   alert("Error saving meeting")
    // }
   },
   async saveVideoVideoToGCS() {
    const response = await MeetingAPI.saveVideoVideoToGCS(this.video.video)
    let video_gcs_url = response.data
    this.video.video_url = video_gcs_url
    this.meeting.videos = [this.video]
   },
   async saveVideoVideosToGCS() {
     const response = await MeetingAPI.saveVideoVideosToGCS(this.videos)
     let video_gcs_urls = response.data
     for(let i = 0; i < this.videos.length; i++) {
       this.videos[i].video_url = video_gcs_urls[i]
       console.log("Set url",this.videos[i].video_url)
     }
     this.meeting.videos = this.videos
   },
   async saveMeetingToCourseOrOrg() {
     console.log("saving meeting",this.meeting);
     let response = null
     if(this.for_course){
       response = await MeetingAPI.addMeeting(this.meeting,true,this.course_id)
     }else{
       response = await MeetingAPI.addMeeting(this.meeting,false,this.org_id)
     }
     return response.data
   },
   getConfirmationString() {
     let confirmation_string = `Are you sure you want to create this meeting?\n\n`
     if(this.meeting.has_real_time_portion) {
      confirmation_string += `Time Window:\n`
       + `${moment(this.meeting.real_time_portion.real_time_start).format("MMM Do YYYY, h:mm A")}`
       + ` - ${moment(this.meeting.real_time_portion.real_time_end).format("MMM Do YYYY, h:mm A")}\n\n`
      confirmation_string += `QRScan\n`
        + `Submission Window:\n`
        + `${moment(this.qr_scan.qr_scan_start_time).format("MMM Do YYYY, h:mm A")}`
        + ` - ${moment(this.qr_scan.qr_scan_end_time).format("MMM Do YYYY, h:mm A")}\n\n`
     }
     if(this.meeting.has_async_portion) {
      confirmation_string += `Video\n`
        + `video: ${this.video.video.name}\n`
        + `Submission Window:\n`
        + `${moment(this.video.video_submission_start_time).format("MMM Do YYYY, h:mm A")}`
        + ` - ${moment(this.video.video_submission_start_time).format("MMM Do YYYY, h:mm A")}\n\n`
     }
     return confirmation_string
   },
   generateRandomCode() {
     const alnums = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
     let result = "";
     for (let i = 100; i > 0; --i) {
       result += alnums[Math.floor(Math.random() * alnums.length)];
     }
     return result;
   },
   async requestNotificationPermission() {
    let permission = await Notification.requestPermission()
    if (permission === "granted") {
      this.notification_permission_status = "granted"
      this.registerServiceWorkerAndAddSubscription()
    } else if(permission === "default") {
      this.notification_permission_status = "default"
    } else {
      this.notification_permission_status = "blocked"
    }
   },
   async registerServiceWorkerAndAddSubscription() {
    // Register service worker
    console.log("Registering service worker...");
    let register = await navigator.serviceWorker.register("worker.js", {
      scope: "/"
    });
    console.log("Service Worker Registered...", register);
    // Wait until worker is ready
    console.log("Waiting for service worker to be ready...")
    register = await navigator.serviceWorker.ready
    console.log("Service worker ready", register)
    // Register Push
    console.log("Registering Push...");
    const publicVapidKey =
      "BG5zFCphvwcm3WYs3N5d41jO85PcvpJkEYPlz9j3OjVdzI_XX0KPw_U8V5aEmaOBHXIymaGcCWyOAH-TmoobXKA"
    const subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(publicVapidKey)
    });
    console.log("Push Registered...", subscription);
    const response = await UserAPI.addServiceWorkerSubscriptionForUser(
      this.state_user._id,subscription)
    console.log("Added subscription to user", response.data)
   },
   urlBase64ToUint8Array(base64String) {
     const padding = "=".repeat((4 - base64String.length % 4) % 4);
     const base64 = (base64String + padding)
       .replace(/\-/g, "+")
       .replace(/_/g, "/");

     const rawData = window.atob(base64);
     const outputArray = new Uint8Array(rawData.length);

     for (let i = 0; i < rawData.length; ++i) {
       outputArray[i] = rawData.charCodeAt(i);
     }
     return outputArray;
   },
   scheduleShowQRNotificationsForInstructors(meeting) {
    let primary_instructor_id = this.course.instructor._id
    let secondary_instructor_id = this.course.secondary_instructor ?
    this.course.secondary_instructor._id : null
    NotificationAPI.scheduleShowQRNotificationForInstructors(
      primary_instructor_id, secondary_instructor_id, meeting._id,
      this.qr_scan.qr_scan_start_time)
   },
   selectSection(section) {
    let [meeting_has_section, index] = this.meetingHasSection(section)
    let section_container = document.getElementById(`section${section.section_number}`);
    if(meeting_has_section)
      this.removeSectionFromMeeting(index, section_container)
    else {
      this.addSectionToMeeting(section, section_container)
    }
   },
   meetingHasSection(section) {
    let meeting_has_section = false
    let index = -1
    for(let i = 0; i < this.meeting.sections.length; i++) {
      if(this.meeting.sections[i].section_number
          === section.section_number){
        meeting_has_section = true
        index = i 
        break
      }
    }
    return [meeting_has_section, index]
   },
   addSectionToMeeting(section, section_container) {
    this.meeting.sections.push(section)
    section_container.classList.add("selected-section")
   },
   removeSectionFromMeeting(index, section_container) {
     this.meeting.sections.splice(index, 1);
     section_container.classList.remove("selected-section")
   }
  }
}
</script>
<style lang="scss">

.light-mode {
  .submission-fullscreen {
    background-color: white;
  }
}

.dark-mode {
  .submission-fullscreen {
    background-color: #121419;
  }
}

.new-meeting-datetime-picker {
  width: 32rem;
  height: 3rem;
  border: 2px solid #47C4FC;
  border-radius: 5px;
  padding-left: 0.75rem;
}

.new-meeting-datetime-picker:disabled {
  background-color: #cccccc;
  color: white;
  border: black solid;
}

.new-meeting-datetime-picker:disabled::placeholder {
  color: #cccccc;
}

.submission-fullscreen {
  position:fixed;
  z-index: 100;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;

  .centerer {
    width: 300px;
    height: 300px;
    margin: 0 auto;
    position: relative;
    top: 25%;
  }
}

.section-selectors {
  width: 32rem;
  position: relative;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.section-selector {
  display: inline-block;
  text-align: center;
  margin: auto;
  margin-left: 0.75rem;
  border: #adadad solid thin;
  cursor: pointer;
  border-radius: 3px;
  height: 2rem;
  width: 6rem;
  padding-top: 0.2rem;
}

.selected-section {
  background-color: #47C4FC;
  border: #47C4FC solid;
  color: white;
}

.notification-message {
  text-align:center;
  height: 5rem;
  width: 100%;
  margin-top: 1rem;
  font-weight: bold;
  font-size: 1.5rem;

  span {
    font-weight: bold;
    color: blue;
    cursor: pointer;
  }
}

.new-meeting-form {
  position: fixed;
  left: 0;
  right: 0;
  top: 100px;
  bottom: 0;
  overflow-y: scroll;

  .form-center {
    width: 1000px;
    margin: 0 auto;
    display: flex;
    position: relative;

    .left-side-area {
      width: 250px;
      min-width: 250px;
      text-align: right;
      padding-right: 40px;
      box-sizing: border-box;
      position: fixed;
      top: 100px;
      bottom: 50px;

      .logo-area {
        width: 50px;
        height: 50px;
        display: inline-block;
        background-image: url('~@/assets/logo.svg');
        background-size: 100%;
        margin-bottom: 15px;
      }

      .tasks-list {
        margin-top: 10px;
        margin-bottom: 25px;

        .section-header {
          font-size: 0.85rem;
          margin-bottom: 8px;
          opacity: 0.9;
        }

        .empty-area {
          font-size: 1rem;
          font-style: italic;
        }
      }
    }

    .right-side-area {
      width: 750px;
      transform: translateX(250px);

      .info-area {
        font-size: 0.8rem;
        position: relative;
        top: -8px;
      }

      .new-meeting-title {
        height: 50px;
        margin-bottom: 30px;

        h3 {
          margin: 0;
        }

        .label {
          font-size: 0.8rem;
        }
      }

      .real_time-meeting-portion {
        margin-top: 30px;
        margin-bottom: 30px;

        .video-upload-holder {
          height: 100px;
          border: 2px dashed #eee;
          margin-top: 30px;
          border-radius: 5px;
          text-align: center;
          padding-top: 30px;
          cursor: pointer;

          &.active {
            border: 2px dashed #268ebd;
          }

          input[type=file] {
            display: none;
          }

          .small {
            font-size: 0.7rem;
            opacity: 0.9;
          }
        }

        .clear {
          cursor: pointer;
          float: right;
          margin-top: 0.5rem;
        }

        .checkbox {
          margin-bottom: 5px;
          margin-top: 5px;

          input {
            
          }

          label {
            margin-left: 8px;
            font-size: 0.9rem;
          }
        }

        .meeting-time-picker-area {
          
          .date-label {
            font-size: 0.8rem;
          }
        }
      }
    }
  }

  input.field-input {
    border: 2px solid #47C4FC !important;
    transition: border 0.25s;

    &:focus {
      border: 2px solid #268ebd !important; 
    }
  }

  .time-picker-column-item-effect,
  .datepicker-day.selected .datepicker-day-effect,
  .header-picker {
    background-color: #47C4FC !important;
  }
}

</style>