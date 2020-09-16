<template>
  <div class="add-recording-modal">
    <div class="center-modal">
      <div><h3>Add Recording</h3></div>
      <div :class="`add-recording ${recording_video == null ? '' : 'active'}`" @click="showFileSelector">
        <div v-if="recording_video == null">Click to add a recording</div>
        <div v-else>{{ recording_video.name }}</div>
        <input type="file" id="recording-upload-input" @change="setRecordingFile" />
      </div>

      <div class="time-picker-area">
        <div class="picker">
          <div class="label">START</div>
          <input class="datetime-picker" placeholder="Select date & time"
          id="recording-submission-start" aria-labelledby="start_time_label" type="datetime-local"/>
        </div>
        <div class="spacer"></div>
        <div class="picker end">
          <div class="label">END</div>
          <input class="datetime-picker" placeholder="Select date & time"
          id="recording-submission-end" aria-labelledby="end_time_label" type="datetime-local"/>
        </div>
      </div>

      <div class="submit-line" :style="{display: 'flex'}">
        <div>
          <router-link :to="{name: 'meeting_info', params: {meeting_id: $route.params.meeting_id}}">
            <sui-button content="Cancel" icon="left arrow" label-position="left" />
          </router-link>
        </div>

        <div :style="{flexGrow: 1, textAlign: 'right'}">
          <!-- <sui-button @click="addRecording" class="venue-blue">Upload Recording</sui-button> -->
          <Button2 
            text="Upload Recording"
            :config="{
              width: '80%',
              height: '36px',
              lineHeight: '20px'
            }"
            :disabled="!recordingFormValid"
            :valid="recordingFormValid"
            :onClick="addRecording"
          />
        </div>

      </div>
      <UploadSuccessAnimation v-if="meeting_saving" />
    </div>
  </div>
</template>

<script>
import MeetingAPI from '@/services/MeetingAPI.js';
import UploadSuccessAnimation from '@/components/animations/UploadSuccessAnimation.vue';
import Button2 from '@/components/Button2.vue';
import flatpickr from "flatpickr";
import 'flatpickr/dist/themes/material_blue.css';

export default {
  name: 'AddRecording',
  components: {
    Button2,
    UploadSuccessAnimation,
  },
  data () {
    return {
      recording_submission_start_time: null,
      recording_submission_end_time: null,
      recording_video: null,
      meeting_saving: false,
    }
  },
  computed: {
    recordingFormValid () {
      return this.recording_submission_start_time != null 
      && this.recording_submission_end_time != null
      && this.recording_video != null
    }
  },
  created () {
    this.setDateInputs()
  },
  methods: {
    setDateInputs() {
      this.$nextTick(() => {
        let self = this
        let start_time_picker = flatpickr(document.getElementById("recording-submission-start"),{
          enableTime: true,
          dateFormat: "h:i K, M d, Y",
          minDate: Date.now(),
          minuteIncrement: 1,
          onChange: function(selectedDates, dateStr, instance) {
            self.recording_submission_start_time = Date.parse(dateStr)
            // Set the new min end time to 15 minutes after the new start time
            let new_min_end_time = new Date(self.recording_submission_start_time)
            new_min_end_time.setMinutes(new_min_end_time.getMinutes() + 15)
            end_time_picker.set("minDate",new_min_end_time)
            // Update end time if invalid
            let fifteen_mins = 60 * 15 * 1000
            if(self.recording_submission_start_time > self.recording_submission_end_time
              || !self.recording_submission_end_time ) {
              self.recording_submission_end_time = self.recording_submission_start_time + fifteen_mins
              end_time_picker.setDate(self.recording_submission_end_time)
            }
            // Keep the dates 15 minutes apart
            if((self.recording_submission_start_time + fifteen_mins) > self.recording_submission_end_time) {
              self.recording_submission_end_time = self.recording_submission_start_time + fifteen_mins
              end_time_picker.setDate(self.recording_submission_end_time)
            }
          }
        })
        let end_time_picker = flatpickr(document.getElementById("recording-submission-end"),{
          enableTime: true,
          dateFormat: "h:i K, M d, Y",
          minDate: Date.now(),
          minuteIncrement: 1,
          onChange: function(selectedDates, dateStr, instance) {
            self.recording_submission_end_time = Date.parse(dateStr)
          }
        })
      })
    },
    showFileSelector() {
      document.getElementById("recording-upload-input").click()
    },
    setRecordingFile (e) {
      // todo check if valid file extension
      this.recording_video = e.target.files[0]
    },
    async addRecording () {
      console.log("In addRecording about to make API call")
      this.meeting_saving = true
      const response = await MeetingAPI.saveRecordingVideoToGCS(this.recording_video)
      let video_url = response.data
      let recording = {
        video_url: video_url,
        recording_submission_start_time: this.recording_submission_start_time,
        recording_submission_end_time: this.recording_submission_end_time
      }
      await MeetingAPI.addRecordingToMeeting (this.$route.params.meeting_id,
        recording)
      // show the uploading animation
      setTimeout(() => {
        this.meeting_saving = false;
        this.show_add_recording = false;
      }, 2000)
      this.$router.push({name: 'meeting_info', params: {meeting_id: this.$route.params.meeting_id}})
    }
  }
}
</script>

<style lang="scss" scoped>
.datetime-picker {
  border: 1px solid rgba(0,0,0,.2);
  border-radius: 4px;
  height: 3rem;
  text-align: center;
  margin-top: 0.5rem;
}

.time-picker-area {
  display: flex;
  margin: 20px 0;

  .end {
    text-align: right;
  }

  .spacer {
    flex-grow: 1;
  }
}

.dark-mode .add-recording-modal {
  background-color: #121419;

  
  .add-recording {
    border: 3px dashed rgba(255, 255, 255, 0.5);
  }
}

.light-mode .add-recording-modal {
  background-color: white;

  .add-recording {
    border: 3px dashed rgba(0, 0, 0, 0.5);
  }
}

.add-recording-modal {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  .center-modal {
    width: 500px;
    margin: 0 auto;
    position: relative;
    top: 40%;
    transform: translateY(-50%);

    .add-recording {
      margin: 10px 0;
      height: 100px;
      border-radius: 5px;
      box-sizing: border-box;
      padding: 30px 0 0 0;
      font-size: 1.2rem;
      text-align: center;
      cursor: pointer;

      input[type=file] {
        visibility: hidden;
      }

      &.active {
        border: 3px dashed #47C4FC;
      }
    }
  }
}
</style>