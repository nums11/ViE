<template>
  <div>
    <!-- Preview Modal -->
    <sui-modal v-model="show_modal">
      <sui-modal-header>
        Edit Video
        <sui-button @click="hideModal"
        class="exit-btn" icon="x" color="blue"></sui-button>
      </sui-modal-header>
      <sui-modal-content>
        <div class="input-area">
          <sui-label class="input-label" icon="clock outline">START</sui-label>
          <input class="datetime-picker" placeholder="Select date & time"
          id="video-submission-start" aria-labelledby="start_time_label" type="datetime-local"/>
        </div>
        <div class="input-area">
          <sui-label class="input-label" icon="clock outline">End</sui-label>
          <input class="datetime-picker" placeholder="Select date & time"
          id="video-submission-end" aria-labelledby="end_time_label" type="datetime-local"/>
        </div>
      </sui-modal-content>
      <sui-modal-actions>
        <Button2
          class="upload-video-btn" 
          text="Update Video Times"
          :config="{
            width: '40%',
            height: '36px',
            lineHeight: '20px',
          }"
          :disabled="!videoFormValid"
          :valid="videoFormValid"
          :onClick="updateVideo"
        />
      </sui-modal-actions>
    </sui-modal>
  </div>
</template>

<script>
import flatpickr from "flatpickr";
import 'flatpickr/dist/themes/material_blue.css';
import Button2 from '@/components/Button2.vue';

export default {
  name: 'EditVideoModal',
  components: {
    Button2
  },
  props:{
  },
  data() {
    return {
      video_submission_start_time: null,
      video_submission_end_time: null,
      show_modal: false,
      original_video: Object,
    }
  },
  computed: {
    videoFormValid () {
      return this.video_submission_start_time != null 
      && this.video_submission_end_time != null
    }
  },
  created() {
    this.fifteen_mins = 60 * 15 * 1000
  },
  methods: {
    showModal(original_video) {
      this.$forceUpdate()
      console.log("Just got called. Original Video", original_video)
      this.original_video = original_video
      this.show_modal = true
      this.setDateInputs()
    },
    hideModal() {
      this.show_modal = false
    },
    setDateInputs() {
      console.log("SetDateInputs called", this.original_video)
      this.$nextTick(() => {
        let self = this
        let start_time_picker = flatpickr(document.getElementById("video-submission-start"),{
          enableTime: true,
          dateFormat: "M d Y, h:i K",
          minDate: Date.now(),
          defaultDate: this.original_video.video_submission_start_time,
          minuteIncrement: 1,
          onChange: function(selectedDates, dateStr, instance) {
            self.video_submission_start_time = Date.parse(dateStr)
            // Set the new min end time to 15 minutes after the new start time
            let new_min_end_time = new Date(self.video_submission_start_time)
            new_min_end_time.setMinutes(new_min_end_time.getMinutes() + 15)
            end_time_picker.set("minDate",new_min_end_time)
            console.log("Set min date to", new_min_end_time)
            // Update end time if invalid
            let fifteen_mins = 60 * 15 * 1000
            if(self.video_submission_start_time > self.video_submission_end_time
              || !self.video_submission_end_time ) {
              self.video_submission_end_time = self.video_submission_start_time + fifteen_mins
              end_time_picker.setDate(self.video_submission_end_time)
            }
            // Keep the dates 15 minutes apart
            if((self.video_submission_start_time + fifteen_mins) > self.video_submission_end_time) {
              self.video_submission_end_time = self.video_submission_start_time + fifteen_mins
              end_time_picker.setDate(self.video_submission_end_time)
            }
          }
        })
        let end_time_picker = flatpickr(document.getElementById("video-submission-end"),{
          enableTime: true,
          dateFormat: "M d Y, h:i K",
          minDate: Date.now() + this.fifteen_mins,
          defaultDate: this.original_video.video_submission_end_time,
          minuteIncrement: 1,
          onChange: function(selectedDates, dateStr, instance) {
            self.video_submission_end_time = Date.parse(dateStr)
          }
        })
      })
    },
    updateVideo() {
      console.log("Original", new Date(this.original_video.video_submission_start_time))
      console.log("New",new Date(this.video_submission_start_time))
      console.log("Yup")
    },
    // Broken
    datesHaveChanged() {
      return ((new Date(this.original_video.video_submission_start_time)).getTime()
        !== (new Date(this.video_submission_start_time)).getTime()
        && (new Date(this.original_video.video_submission_end_time)).getTime()
        !== (new Date(this.video_submission_end_time)).getTime())
    }
  }
}
</script>

<style lang="scss" scoped>
.exit-btn {
  float: right;
}

.input-area {
  width: 35%;
  display:inline-block;
  margin-left: 6rem;

  .input-label {
    margin-right: 1rem;
  }

  .datetime-picker {
    border: 1px solid rgba(0,0,0,.2);
    border-radius: 4px;
    height: 3rem;
    text-align: center;
    margin-top: 0.5rem;
    display: inline-block;
  }
}

.upload-video-btn {
  float: left;
  margin-left: 18rem;
  margin-bottom: 1rem;
}
</style>
