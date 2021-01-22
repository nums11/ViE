<template>
  <div id="meeting-settings">
    <div id="section-header">Settings</div>
    <h3>Meeting Details</h3>
    <sui-form id="meeting-settings-form">
      <sui-form-field>
        <label>Title</label>
        <input type="text" v-model="meeting_copy.title" />
      </sui-form-field>
    </sui-form>
    <div class="meeting-portion-container inline-block">
      <h4>Real-Time Portion</h4>
      <div v-if="meeting_copy.real_time_portion == null">
        No Real-Time Portion
      </div>
      <sui-form v-else class="portion-form">
        <sui-form-field>
          <label>Real-Time Window</label>
          <input type="datetime-local" id="real-time-input" />
        </sui-form-field>
        <div v-for="(qr_scan, index) in
        meeting_copy.real_time_portion.qr_scans"
        class="mt-2">
          QR Scan {{ index+1 }}
          <div class="mt-1">
            <sui-form-field>
              <label>Reminder</label>
              <div class="inline-block" style="width:50%;">
                <input type="datetime-local"
                :id="`qr-scan-${index+1}`"
                :placeholder="qr_scan.reminder_time == null ?
                'No reminder' : ''" />
              </div>
              <sui-button size="tiny" animated
              style="background-color:#FF0000; 
              color:white;margin-left:2rem;">
                <sui-button-content visible>
                  Delete QR Scan
                </sui-button-content>
                <sui-button-content hidden>
                    <sui-icon name="trash" />
                </sui-button-content>
              </sui-button>
            </sui-form-field>
          </div>
        </div>
        <div class="inline-block mt-2 ">
          <sui-button size="tiny" animated
          style="background-color:#FF0000; 
          color:white; margin:auto;">
            <sui-button-content visible>
              Delete Real-Time Portion
            </sui-button-content>
            <sui-button-content hidden>
                <sui-icon name="trash" />
            </sui-button-content>
          </sui-button>
        </div>
      </sui-form>
    </div>
    <div
    class="meeting-portion-container inline-block ml-2">
      <h4>Async Portion</h4>
      <div v-if="meeting_copy.async_portion == null">
        No Async Portion
      </div>
      <sui-form v-else class="portion-form">
        <sui-form-field>
          <label>Async Window</label>
          <input type="datetime-local" id="async-time-input" />
        </sui-form-field>
        <div v-for="video in
        meeting_copy.async_portion.videos"
        class="mt-2">
          <div class="mt-1">
            <sui-form-field>
              <label>Video Name</label>
              <input type="text"
              v-model="video.name" style="width: 50%;" />
              <sui-button size="tiny" animated
              style="background-color:#FF0000; 
              color:white;margin-left:2rem;">
                <sui-button-content visible>
                  Delete Video
                </sui-button-content>
                <sui-button-content hidden>
                    <sui-icon name="trash" />
                </sui-button-content>
              </sui-button>
            </sui-form-field>
          </div>
        </div>
        <div class="inline-block mt-2 ">
          <sui-button size="tiny" animated
          style="background-color:#FF0000; 
          color:white; margin:auto;">
            <sui-button-content visible>
              Delete Async Portion
            </sui-button-content>
            <sui-button-content hidden>
                <sui-icon name="trash" />
            </sui-button-content>
          </sui-button>
        </div>
      </sui-form>
    </div>
    <div class="course-action-btns-container">
      <sui-button @click="updateMeeting"
        animated size="small"
        style="background-color:#00B3FF; color:white;">
        <sui-button-content visible>
          Update Meeting
        </sui-button-content>
        <sui-button-content hidden>
          <sui-icon name="sync" />
        </sui-button-content>
      </sui-button>
      <sui-button 
        animated size="small"
        style="background-color:#FF0000; color:white;">
        <sui-button-content visible>
          Delete Meeting
        </sui-button-content>
        <sui-button-content hidden>
          <sui-icon name="trash" />
        </sui-button-content>
      </sui-button>
    </div>
  </div>
</template>

<script>
import helpers from '@/helpers.js'
import flatpickr from "flatpickr";
import 'flatpickr/dist/themes/material_blue.css';
import moment from 'moment'
import MeetingAPI from '@/services/MeetingAPI'

export default {
  name: 'MeetingSettings',
  mixins: [helpers],
  components: {
  },
  props: {
    meeting: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      meeting_copy: null,
    }
  },
  computed: {
    courseHas1Section() {

    }
  },
  created () {
    this.setCopyVariables()
  },
  mounted () {
    this.initTimePicker()
  },
  methods: {
    setCopyVariables() {
      this.meeting_copy = {
        title: this.meeting.title,
        real_time_portion: null,
        async_portion: null,
        _id: this.meeting._id
      }
      if(this.meeting.real_time_portion != null) {
        this.meeting_copy.real_time_portion = {
          real_time_start: this.meeting.real_time_portion.real_time_start,
          real_time_end: this.meeting.real_time_portion.real_time_end,
          qr_scans: [],
          _id: this.meeting.real_time_portion._id
        }
        const qr_scans = this.meeting.real_time_portion.qr_scans
        qr_scans.forEach(qr_scan => {
          this.meeting_copy.real_time_portion.qr_scans.push({
            reminder_time: qr_scan.reminder_time,
            _id: qr_scan._id
          })
        })
      }
      if(this.meeting.async_portion != null) {
        this.meeting_copy.async_portion = {
          async_start: this.meeting.async_portion.async_start,
          async_end: this.meeting.async_portion.async_end,
          videos: [],
          _id: this.meeting.async_portion._id
        }
        const videos = this.meeting.async_portion.videos
        videos.forEach(video => {
          this.meeting_copy.async_portion.videos.push({
            name: video.name,
            _id: video._id
          })
        })
      }
    },
    initTimePicker() {
      let self = this
      if(this.meeting_copy.real_time_portion != null) {
        self.real_time_picker = flatpickr('#real-time-input', {
          enableTime: true,
          mode: "range",
          altInput: true,
          altFormat: "M/D, h:mm a",
          defaultDate: `${self.meeting_copy.real_time_portion.real_time_start}`
          + ` to ${self.meeting_copy.real_time_portion.real_time_end}`,
          parseDate: (datestr, format) => {
            return moment(datestr, format, true).toDate();
          },
          formatDate: (date, format, locale) => {
            // locale can also be used
            return moment(date).format(format);
          },
          onChange: function (selected_dates) {
            self.updateTimeWindowTimes(true,selected_dates)
          }
        })
        const qr_scans = self.meeting_copy.real_time_portion.qr_scans
        for (let i = 0; i < qr_scans.length; i++) {
          flatpickr(`#qr-scan-${i+1}`, {
            enableTime: true,
            altInput: true,
            altFormat: "M/D, h:mm a",
            defaultDate: qr_scans[i].reminder_time,
            parseDate: (datestr, format) => {
              return moment(datestr, format, true).toDate();
            },
            formatDate: (date, format, locale) => {
              // locale can also be used
              return moment(date).format(format);
            },
            onChange: function (selected_dates) {
              self.updateQRTime(i, selected_dates)
            }
          })
        }
      }
      if(this.meeting_copy.async_portion != null) {
        self.async_time_picker = flatpickr('#async-time-input', {
          enableTime: true,
          mode: "range",
          altInput: true,
          altFormat: "M/D, h:mm a",
          defaultDate: `${self.meeting_copy.async_portion.async_start}`
          + ` to ${self.meeting_copy.async_portion.async_end}`,
          parseDate: (datestr, format) => {
            return moment(datestr, format, true).toDate();
          },
          formatDate: (date, format, locale) => {
            // locale can also be used
            return moment(date).format(format);
          },
          onChange: function (selected_dates) {
            self.updateTimeWindowTimes(false, selected_dates)
          }
        })
      }
    },
    updateTimeWindowTimes(is_real_time, new_times) {
      if(is_real_time) {
        this.meeting_copy.real_time_portion.real_time_start = new_times[0]
        this.meeting_copy.real_time_portion.real_time_end = new_times[1]
      } else {
        this.meeting_copy.async_portion.async_start = new_times[0]
        this.meeting_copy.async_portion.async_end = new_times[1]
      }
    },
    updateQRTime(index, new_times) {
      this.meeting_copy.real_time_portion.qr_scans[index].reminder_time
        = new_times[0]
    },
    async updateMeeting() {
      try {
        await MeetingAPI.updateMeeting(
          this.meeting._id, this.meeting_copy)
        this.updateMeetingValues()
        alert("Meeting updated")
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong")
      }
    },
    updateMeetingValues() {
      // Changed Dates to ISOString to fix flatpickr format bug
      this.meeting.title = this.meeting_copy.title
      if(this.meeting.real_time_portion != null) {
        this.meeting.real_time_portion.real_time_start
          = (new Date(this.meeting_copy.real_time_portion.real_time_start))
            .toISOString()
        this.meeting.real_time_portion.real_time_end
          = (new Date(this.meeting_copy.real_time_portion.real_time_end))
            .toISOString()
        for(let i = 0; i < this.meeting.real_time_portion.qr_scans.length;
          i++) {
          this.meeting.real_time_portion.qr_scans[i].reminder_time
            = this.meeting_copy.real_time_portion.qr_scans[i].reminder_time
        }
      }
      if(this.meeting.async_portion != null) {
        this.meeting.async_portion.async_start
          = (new Date(this.meeting_copy.async_portion.async_start))
            .toISOString()
        this.meeting.async_portion.async_end
          = (new Date(this.meeting_copy.async_portion.async_end))
            .toISOString()
        for(let i = 0; i < this.meeting.async_portion.videos.length;
          i++) {
          this.meeting.async_portion.videos[i].name
            = this.meeting_copy.async_portion.videos[i].name
        }
      }
    }
  }
}
</script>

<style scoped>
#section-header {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

#meeting-settings-form {
  width: 30rem;
  margin-top: 0;
  margin-left: 0;
}

.meeting-portion-container {
  /*border: red solid;*/
  width: 48%;
  margin-top: 2rem;
  /*text-align: center;*/
}

.portion-form {
  margin-top: 0;
  /*border: blue solid;*/
  width: 95%;
}

.course-action-btns-container {
  width: 20rem;
  margin: auto;
  margin-top: 4rem;
}
</style>