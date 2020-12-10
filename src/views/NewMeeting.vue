<template>
  <div>
    <div v-if="notification_permission_status === 'default' && meeting.has_live_attendance"
    class="notification-message">You currently do not have notifications enabled for Venue, so you will not be able to receive a notification for any QR Codes that become available. To enable notifications click <span @click="requestNotificationPermission">here</span>.</div>
    <div v-else-if="notification_permission_status === 'blocked' && meeting.has_live_attendance"
    class="notification-message">You currently have notifications blocked for Venue, so you will not be able to receive a notification for any QR Codes that become available. To enable notifications click on the icon in the top left of your search bar and set notifications to "Allow".</div>
    <div class="new-meeting-form">
      <div class="form-center">
        <div class="left-side-area">
          <div class="logo-area"></div>
          <div class="tasks-list">
            <div class="section-header">LIVE TASKS</div>
            <div class="empty-area">No live tasks</div>
          </div>
          <div class="tasks-list">
            <div class="section-header">ASYNCHRONOUS TASKS</div>
            <div class="empty-area">No asynchronous tasks</div>
          </div>
        </div>

        <div class="right-side-area"> 
          <div class="new-meeting-title">
            <div class="label">NEW MEETING</div>
            <h3>{{ for_course ? course.name : org.name}}</h3>
          </div>
          <div class="meeting-name">
            <InputField2
              v-model="meeting.title"
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

          <div class="live-meeting-portion">
            <div>
              <div class="checkbox">
                <input type="checkbox" @click="toggleLiveInputs" />
                <label>Include QR Code Checkin</label>
              </div>
            </div>
            <transition name="fade" mode="out-in">
              <div v-if="meeting.has_live_attendance">

                <div class="meeting-time-picker-area" :style="{width: '60%'}">
                  <h4 style="margin-top:1rem;">Meeting Times</h4>
                  <div class="info-area">
                    Choose the start and end times for the live portion of your meeting.
                  </div>
                  <div class="date-label">START TIME</div>
                  <input class="new-meeting-datetime-picker" placeholder="Select date & time"
                  id="meeting_start" aria-labelledby="start_time_label" type="datetime-local"/>
                  <div class="date-label" :style="{marginTop: '20px'}">END TIME</div>
                  <input class="new-meeting-datetime-picker" placeholder="Select date & time"
                  id="meeting_end" aria-labelledby="end_time_label" type="datetime-local"
                  :disabled="!meetingHasStartTime"/>
                </div>

                <div class="meeting-time-picker-area" :style="{width: '60%', marginTop: '30px'}">
                  <h4>QR Checkin Times</h4>
                  <div class="info-area" >
                    Choose the time window for which students will be able to scan a QR code for
                    attendance during the live portion of your meeting. You will receive a notification to
                    show the QR Code to your students at the start time.
                  </div>
                  <div class="date-label">START TIME</div>
                  <input class="new-meeting-datetime-picker" placeholder="Select date & time"
                  id="qr_checkin_start" aria-labelledby="qr_start_time_label" type="datetime-local"
                  :disabled="!meetingHasStartAndEndTime"/>
                  <div class="date-label" :style="{marginTop: '20px'}">END TIME</div>
                  <input class="new-meeting-datetime-picker" placeholder="Select date & time"
                  id="qr_checkin_end" aria-labelledby="qr_end_time_label" type="datetime-local"
                  :disabled="!meetingHasStartAndEndTime || !qrCheckinHasStartTime"/>
                </div>

              </div>
            </transition>
          </div>

          <div class="live-meeting-portion">
            <div>
              <div class="checkbox">
                <input type="checkbox" @click="toggleAsyncInputs" />
                <label>Include recording</label>
              </div>
            </div>
            <transition name="fade" mode="out-in">
              <div v-if="meeting.has_async_attendance">
                <div class="meeting-time-picker-area" :style="{width: '60%'}">
                  <h4 style="margin-top:1rem;">Video Recording</h4>
                  <div class="info-area">
                    Choose the time window for which your students are allowed to watch
                    the recording for attendance. The recording will become available for student viewing
                    at the beginning of the time window and will remain available after the end of the
                    time window, however, afterward students will not be able to watch for attendance.
                  </div>
                  <div :class="`video-upload-holder ${recording.video != null ? 'active' : ''}`" @click="showFileSelector">
                    <div v-if="recording.video == null">
                      <p>Click to add a recording</p>
                      <p class="small">File format (.mp4, .wav, etc?)</p>
                    </div>
                    <div v-else>{{ recording.video.name }}</div>
                    <input type="file" id="recording-upload-input" @change="setRecordingFile" />
                  </div>
                  <div v-if="recording.video != null" class="clear" @click="clearVideoUpload">clear</div>
                  <div class="date-label" style="margin-top:2rem;">START TIME</div>
                  <input class="new-meeting-datetime-picker" placeholder="Select date & time"
                  id="recording_submission_start" aria-labelledby="recording_submission_start_time" type="datetime-local" />
                  <div class="date-label" :style="{marginTop: '20px'}">END TIME</div>
                  <input class="new-meeting-datetime-picker" placeholder="Select date & time"
                  id="recording_submission_end" aria-labelledby="recording_submission_end_time" type="datetime-local"
                  :disabled="!recordingHasStartTime" />
                </div>
              </div>
            </transition>
          </div>

          <div class="live-meeting-portion">
            <Button2 
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
              }" />
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
import OrgAPI from '@/services/OrgAPI'
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
      meeting: {
        title: "",
        has_live_attendance: false,
        has_async_attendance: false,
        start_time: null,
        end_time: null,
        sections: []
      },
      // TODO: Remove these and use the arrays to
      // allow for multiple qr checkins and recordings
      qr_checkin: {
        qr_checkin_start_time: null,
        qr_checkin_end_time: null
      },
      recording: {
        video: null,
        recording_submission_start_time: null,
        recording_submission_end_time: null
      },
      qr_checkins: [],
      recordings: [],
      for_course: false,
      meeting_saving: false,
      course: {},
      org: {},
      start_time_picker: null,
      end_time_picker: null,
      qr_start_time_picker: null,
      qr_end_time_picker: null,
      recording_start_time_picker: null,
      recording_end_time_picker: null,
      live_tasks: [],
      async_tasks: [],
      meeting_data: {},
      course_org_info: null,
      notification_permission_status: ""
    }
  },
  computed: {
    meetingHasStartTime() {
      return this.meeting.start_time != null
    },
    meetingHasStartAndEndTime() {
      return this.meeting.start_time != null && this.meeting.end_time != null
    },
    qrCheckinHasStartTime() {
      return this.qr_checkin.qr_checkin_start_time != null
    },
    recordingHasStartTime() {
      return this.recording.recording_submission_start_time != null
    },
    meetingCanBeCreated() {
      if(this.meeting.title === "") return false;
      if(this.meeting.sections.length === 0) return false;
      if(!(this.meeting.has_live_attendance || this.meeting.has_async_attendance))
        return false
      if(this.meeting.has_live_attendance){
        if(this.meeting.start_time == null ||
          this.meeting.end_time == null ||
          this.qr_checkin.qr_checkin_start_time == null ||
          this.qr_checkin.qr_checkin_end_time == null)
          return false
      }
      if(this.meeting.has_async_attendance){
        if(this.recording.recording_submission_start_time == null ||
          this.recording.recording_submission_end_time == null)
          return false
      }
      return true
    }
  },
  created () {
    this.current_user = this.$store.state.user.current_user
    this.getNotificationPermissionStatus()
    this.getCourseOrOrg()
  },
  methods: {
    getNotificationPermissionStatus() {
      if(Notification.permission === "default")
        this.notification_permission_status = "default"
      else if(Notification.permission === "granted")
        this.notification_permission_status = "granted"
      else
        this.notification_permission_status = "blocked"
    },
    async getCourseOrOrg() {
      if(this.$route.name === "course_new_meeting"){
        this.course_id = this.$route.params.course_id;
        this.for_course = true
        const response = await CourseAPI.getCourse(this.course_id)
        this.course = response.data
        this.meeting.for_course = true
        // this.meeting.course = this.course._id
      } else {
        this.org_id = this.$route.params.org_id;
        const response = await OrgAPI.getOrg(this.org_id)
        this.org = response.data
        this.meeting.for_course = false
        this.meeting.org = this.org
      }
    },
    toggleLiveInputs() {
      this.meeting.has_live_attendance = !this.meeting.has_live_attendance
      if(this.meeting.has_live_attendance)
        this.initLiveDateInputs()
      else
        this.resetLiveDateInputs()
    },
    toggleAsyncInputs() {
      this.meeting.has_async_attendance = !this.meeting.has_async_attendance
      if(this.meeting.has_async_attendance)
        this.initAsyncDateInputs()
      else
        this.resetAsyncDateInputs()
    },
    initLiveDateInputs() {
      this.$nextTick(() => {
        this.initMeetingStartInput(this)
        this.initMeetingEndInput(this)
        this.initQRCheckinStartInput(this)
        this.initQRCheckinEndInput(this)
      })
    },
    initAsyncDateInputs() {
      this.$nextTick(() => {
        this.initRecordingSubmissionStartInput(this)
        this.initRecordingSubmissionEndInput(this)
      })
    },
    initMeetingStartInput(self) {
      self.start_time_picker = flatpickr(document.getElementById("meeting_start"),{
        enableTime: true,
        dateFormat: "M d Y, h:i K",
        minDate: Date.now(),
        minuteIncrement: 1,
        onChange: function(selectedDates, dateStr, instance) {
          self.meeting.start_time = Date.parse(dateStr)
          // Set the new min end time to 15 minutes after the new start time
          let new_min_end_time = new Date(self.meeting.start_time)
          new_min_end_time.setMinutes(new_min_end_time.getMinutes() + 15)
          self.end_time_picker.set("minDate",new_min_end_time)
          // Update meeting end time if invalid
          let fifteen_mins = 60 * 15 * 1000
          if(self.meeting.start_time > self.meeting.end_time ||
            self.meeting.end_time == null) {
            self.meeting.end_time = self.meeting.start_time + fifteen_mins
            self.end_time_picker.setDate(self.meeting.start_time + fifteen_mins)
          }
          // Keep the start and end time 15 minutes apart
          if((self.meeting.start_time + fifteen_mins) > self.meeting.end_time) {
            self.meeting.end_time = self.meeting.start_time + fifteen_mins
            self.end_time_picker.setDate(self.meeting.start_time + fifteen_mins)
          }
          self.clearQRDateInputs(self)
        }
      })
    },
    initMeetingEndInput(self) {
      self.end_time_picker = flatpickr(document.getElementById("meeting_end"),{
        enableTime: true,
        dateFormat: "M d Y, h:i K",
        minDate: Date.now(),
        minuteIncrement: 1,
        onChange: function(selectedDates, dateStr, instance) {
          self.meeting.end_time = Date.parse(dateStr)
          self.clearQRDateInputs(self)
        }
      })
    },
    // QR Checkin start time and end time have to be at least 5 minutes apart
    // and there should also 
    initQRCheckinStartInput(self) {
      self.qr_start_time_picker = flatpickr(document.getElementById("qr_checkin_start"),{
        enableTime: true,
        dateFormat: "M d Y, h:i K",
        minDate: Date.now(),
        minuteIncrement: 1,
        onChange: function(selectedDates, dateStr, instance) {
          self.qr_checkin.qr_checkin_start_time = Date.parse(dateStr)
          // Set the new min qr end time to 5 minutes after the new start time
          let new_min_qr_end_time = new Date(self.qr_checkin.qr_checkin_start_time)
          new_min_qr_end_time.setMinutes(new_min_qr_end_time.getMinutes() + 5)
          self.qr_end_time_picker.set("minDate",new_min_qr_end_time)
          // Update qr end time if invalid
          let five_mins = 60 * 5 * 1000
          if(self.qr_checkin.qr_checkin_start_time > self.qr_checkin.qr_checkin_end_time
            || self.qr_checkin.qr_checkin_end_time == null) {
            self.qr_checkin.qr_checkin_end_time = self.qr_checkin.qr_checkin_start_time + five_mins
            self.qr_end_time_picker.setDate(self.qr_checkin.qr_checkin_start_time + five_mins)
          }
          // Keep the qr start and end time 5 minutes apart
          if((self.qr_checkin.qr_checkin_start_time + five_mins) > self.qr_checkin.qr_checkin_end_time) {
            self.qr_checkin.qr_checkin_end_time = self.qr_checkin.qr_checkin_start_time + five_mins
            self.qr_end_time_picker.setDate(self.qr_checkin.qr_checkin_start_time + five_mins)
          }
        }
      })
    },
    initQRCheckinEndInput(self) {
      self.qr_end_time_picker = flatpickr(document.getElementById("qr_checkin_end"),{
        enableTime: true,
        dateFormat: "M d Y, h:i K",
        minDate: Date.now(),
        minuteIncrement: 1,
        onChange: function(selectedDates, dateStr, instance) {
          self.qr_checkin.qr_checkin_end_time = Date.parse(dateStr)
        }
      })
    },
    initRecordingSubmissionStartInput(self) {
      self.recording_start_time_picker = flatpickr(document.getElementById("recording_submission_start"),{
        enableTime: true,
        dateFormat: "M d Y, h:i K",
        minDate: Date.now(),
        minuteIncrement: 1,
        onChange: function(selectedDates, dateStr, instance) {
          self.recording.recording_submission_start_time = Date.parse(dateStr)
          // Set the new min end time to 15 minutes after the new start time
          let new_min_recording_end_time = new Date(self.recording.recording_submission_start_time)
          new_min_recording_end_time.setMinutes(new_min_recording_end_time.getMinutes() + 15)
          self.recording_end_time_picker.set("minDate",new_min_recording_end_time)
          // Update meeting end time if invalid
          let fifteen_mins = 60 * 15 * 1000
          if(self.recording.recording_submission_start_time > self.recording.recording_submission_end_time ||
            self.recording.recording_submission_end_time == null) {
            self.recording.recording_submission_end_time = self.recording.recording_submission_start_time + fifteen_mins
            self.recording_end_time_picker.setDate(self.recording.recording_submission_start_time + fifteen_mins)
          }
          // Keep the start and end time 15 minutes apart
          if((self.recording.recording_submission_start_time + fifteen_mins) > self.recording.recording_submission_end_time) {
            self.recording.recording_submission_end_time = self.recording.recording_submission_start_time + fifteen_mins
            self.recording_end_time_picker.setDate(self.recording.recording_submission_start_time + fifteen_mins)
          }
        }
      })
    },
    initRecordingSubmissionEndInput(self) {
      self.recording_end_time_picker = flatpickr(document.getElementById("recording_submission_end"),{
        enableTime: true,
        dateFormat: "M d Y, h:i K",
        minDate: Date.now(),
        minuteIncrement: 1,
        onChange: function(selectedDates, dateStr, instance) {
          self.recording.recording_submission_end_time = Date.parse(dateStr)
        }
      })
    },
    resetLiveDateInputs() {
      this.start_time_picker = null
      this.end_time_picker = null
      this.qr_start_time_picker = null
      this.qr_end_time_picker = null
      this.meeting.start_time = null
      this.meeting.end_time = null
      this.qr_checkin.qr_checkin_start_time = null
      this.qr_checkin.qr_checkin_end_time = null
    },
    resetAsyncDateInputs() {
      this.recording_start_time_picker = null
      this.recording_end_time_picker = null
      this.recording.recording_submission_start_time = null
      this.recording.recording_submission_end_time = null
    },
    clearQRDateInputs(self) {
      self.qr_start_time_picker.set("minDate",self.meeting.start_time)
      self.qr_start_time_picker.set("maxDate", self.meeting.end_time)
      self.qr_checkin.qr_checkin_start_time = null
      self.qr_start_time_picker.setDate(null)
      self.qr_end_time_picker.set("minDate",self.meeting.start_time)
      self.qr_end_time_picker.set("maxDate", self.meeting.end_time)
      self.qr_checkin.qr_checkin_end_time = null
      self.qr_end_time_picker.setDate(null)
    },
    cancelForm () {
      if(this.$route.name === 'course_new_meeting')
        this.$router.push({name: 'course_info', params: {id: this.$route.params.course_id}})
      else
        this.$router.push({name: 'org_info', params: {id: this.$route.params.org_id}})
    },
   showFileSelector () {
     document.getElementById("recording-upload-input").click()
   },
   setRecordingFile (e) {
    // todo check if valid file extension
    this.recording.video = e.target.files[0]
   },
   clearVideoUpload () {
     this.recording.video = null
   },
   qrCheckinHasStartAndEndTime() {
     return this.qr_checkin.qr_checkin_start_time != null
   },
    // Todo: Revert this allowing for multiple qr_checkins and recordings
   async createMeeting() {
    let confirmation = confirm(this.getConfirmationString())
    if(confirmation){
      this.meeting_saving = true
      if(this.meeting.has_live_attendance) {
        this.qr_checkin.code = this.generateRandomCode()
        this.meeting.qr_checkins = [this.qr_checkin]
      }
      if(this.meeting.has_async_attendance) 
       await this.saveRecordingVideoToGCS()
      let meeting = await this.saveMeetingToCourseOrOrg()
      this.meeting_saving = false
      if(meeting != null){
        if(meeting.has_live_attendance )
          this.scheduleShowQRNotificationsForInstructors(meeting)
        this.$router.push({name: 'meeting_info', params: {meeting_id: meeting._id}})
      }
      else
        alert("Error saving meeting")
    }
   },
   async saveRecordingVideoToGCS() {
    const response = await MeetingAPI.saveRecordingVideoToGCS(this.recording.video)
    let video_gcs_url = response.data
    this.recording.video_url = video_gcs_url
    this.meeting.recordings = [this.recording]
   },
   async saveRecordingVideosToGCS() {
     const response = await MeetingAPI.saveRecordingVideosToGCS(this.recordings)
     let video_gcs_urls = response.data
     for(let i = 0; i < this.recordings.length; i++) {
       this.recordings[i].video_url = video_gcs_urls[i]
       console.log("Set url",this.recordings[i].video_url)
     }
     this.meeting.recordings = this.recordings
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
     if(this.meeting.has_live_attendance) {
      confirmation_string += `Time Window:\n`
       + `${moment(this.meeting.start_time).format("MMM Do YYYY, h:mm A")}`
       + ` - ${moment(this.meeting.end_time).format("MMM Do YYYY, h:mm A")}\n\n`
      confirmation_string += `QRCheckin\n`
        + `Submission Window:\n`
        + `${moment(this.qr_checkin.qr_checkin_start_time).format("MMM Do YYYY, h:mm A")}`
        + ` - ${moment(this.qr_checkin.qr_checkin_end_time).format("MMM Do YYYY, h:mm A")}\n\n`
     }
     if(this.meeting.has_async_attendance) {
      confirmation_string += `Recording\n`
        + `video: ${this.recording.video.name}\n`
        + `Submission Window:\n`
        + `${moment(this.recording.recording_submission_start_time).format("MMM Do YYYY, h:mm A")}`
        + ` - ${moment(this.recording.recording_submission_start_time).format("MMM Do YYYY, h:mm A")}\n\n`
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
      this.current_user._id,subscription)
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
      this.qr_checkin.qr_checkin_start_time)
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
        background-image: url('~@/assets/venue-logo.svg');
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

      .live-meeting-portion {
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