<template>
  <div class="add-recording-modal">
    <div class="center-modal">
      <div><h3>Add Recording</h3></div>
      <div :class="`add-recording ${recording_to_upload == null ? '' : 'active'}`" @click="showFileSelector">
        <div v-if="recording_to_upload == null">Click to add a recording</div>
        <div v-else>{{ recording_to_upload.name }}</div>
        <input type="file" id="recording-upload-input" @change="setRecordingFile" />
      </div>

      <div class="time-picker-area">
        <div class="picker">
          <div class="label">START</div>
          <VueCtkDateTimePicker 
            @input="$forceUpdate ()"
            v-model="recording_upload_start"
            id="date-input1"
            :min-date="(new Date()).toISOString()"
          />
        </div>
        <div class="spacer"></div>
        <div class="picker end">
          <div class="label">END</div>
          <VueCtkDateTimePicker 
            @input="$forceUpdate ()"
            v-model="recording_upload_end"
            id="date-input2"
            :min-date="(new Date()).toISOString()"
          />
        </div>
      </div>

      <div class="submit-line" :style="{display: 'flex'}">
        <div>
          <sui-button @click="$emit('cancel-add-recording')" content="Cancel" icon="left arrow" label-position="left" />
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

export default {
  name: 'AddRecordingForm',
  components: {
    Button2,
    UploadSuccessAnimation
  },
  data () {
    return {
      recording_upload_start: (new Date()).toISOString (),
      recording_upload_end: null,
      recording_to_upload: null,
      meeting_saving: false,
    }
  },
  computed: {
    recordingFormValid () {
      return this.recording_upload_start != null 
      && this.recording_upload_end != null
      && this.recording_to_upload != null
    }
  },
  created () {
  },
  methods: {
    showFileSelector() {
      document.getElementById("recording-upload-input").click()
    },
    setRecordingFile (e) {
      let file_ = e.target.files[0]
      // todo check if valid file extension
      this.recording_to_upload = file_
    },
    addRecording () {

      this.meeting_saving = true
      // TODO upload this.recording_to_upload to the current meeting
      if (this.recording_to_upload != null && this.recording_upload_start != null && this.recording_upload_end != null) {
        console.log(`ADDING RECORDING`)

        // (1) Upload to Google Cloud
        MeetingAPI.saveRecordingVideosToGCS([{
          video: this.recording_to_upload
        }])
        .then(res => {
          console.log(res)
          let video_url = res.data[0]

          let recording = {
            video_url: video_url,
            allow_recording_submissions: true,
            recording_submission_start_time: new Date(this.recording_upload_start),
            recording_submission_end_time: new Date(this.recording_upload_end)
          }

          MeetingAPI.addRecordingToMeeting (
            this.$route.params.meeting_id,
            recording
          ).then(res => {
            // show the uploading animation
            setTimeout(() => {
              this.meeting_saving = false;
              this.show_add_recording = false;
            }, 2000)
            this.$router.go()
          })
          .catch(err => {
            console.log(`Error updating meeting`)
            console.log(err)
          })

        })
        .catch(err => {
          console.log(`Error uploading to google cloud.`)
          console.log(err)
        })
      }
    },
  }
}
</script>

<style lang="scss" scoped>
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
  z-index: 100000;

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