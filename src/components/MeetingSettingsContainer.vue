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
              <sui-button @click="deleteQRScanOrVideo(
                index,qr_scan._id,true)"
              size="tiny" animated
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
          <sui-button @click="deletePortion(true)"
          size="tiny" animated
          style="background-color:#FF0000; 
          color:white; margin:auto;"
          :disabled="meeting.async_portion == null">
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
        <div v-for="(video, index) in
        meeting_copy.async_portion.videos"
        class="mt-2">
          <div class="mt-1">
            <sui-form-field>
              <label>Video Name</label>
              <input type="text"
              v-model="video.name" style="width: 50%;" />
              <sui-button @click="deleteQRScanOrVideo(
                index,video._id,false)"
              size="tiny" animated
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
          <sui-button @click="deletePortion(false)"
          size="tiny" animated
          style="background-color:#FF0000; 
          color:white; margin:auto;"
          :disabled="meeting.real_time_portion == null">
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
      <sui-button @click="promptMeetingDeletion" 
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
    <MeetingDeletionModal ref="MeetingDeletionModal"
    v-on:delete-meeting="deleteMeeting" />
  </div>
</template>

<script>
import helpers from '@/helpers.js'
import flatpickr from "flatpickr";
import 'flatpickr/dist/themes/material_blue.css';
import moment from 'moment'
import MeetingAPI from '@/services/MeetingAPI'
import QRScanAPI from '@/services/QRScanAPI'
import VideoAPI from '@/services/VideoAPI'
import RealTimePortionAPI from
'@/services/RealTimePortionAPI'
import AsyncPortionAPI from
'@/services/AsyncPortionAPI'
import MeetingDeletionModal from
'@/components/MeetingDeletionModal'

export default {
  name: 'MeetingSettings',
  mixins: [helpers],
  components: {
    MeetingDeletionModal
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
    },
    async deleteQRScanOrVideo(index, id, is_qr_scan) {
      const type = is_qr_scan ? 'QR Scan' : 'Video'
      const confirmation = confirm(`Are you sure you want to`
        + ` permanently delete this ${type}? This will delete all`
        + " student submissions.")
      if(!confirmation)
        return

      try {
        const submission_ids = this.getSubmissionIds(index, is_qr_scan)
        if(is_qr_scan) {
          await QRScanAPI.deleteQRScan(id,
            this.meeting.real_time_portion._id, submission_ids)
        } else {
          await VideoAPI.deleteVideo(id,
            this.meeting.async_portion._id, submission_ids)
        }
        this.removeQRScanOrVideoFromCourse(index, is_qr_scan)
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong")
      }
    },
    getSubmissionIds(index, is_qr_scan) {
      let submissions;
      if(is_qr_scan) {
        submissions =
          this.meeting.real_time_portion.qr_scans[index].submissions
      } else {
        submissions =
          this.meeting.async_portion.videos[index].submissions
      }
      let submission_ids = []
      submissions.forEach(submission => {
        submission_ids.push(submission._id)
      })
      return submission_ids
    },
    removeQRScanOrVideoFromCourse(index, is_qr_scan) {
      if(is_qr_scan) {
        this.meeting.real_time_portion.qr_scans.splice(index,1)
        this.meeting_copy.real_time_portion.qr_scans.splice(index,1)
      } else {
        this.meeting.async_portion.videos.splice(index, 1)
        this.meeting_copy.async_portion.videos.splice(index, 1)
      }
    },
    async deletePortion(is_real_time) {
      const type = is_real_time ? 'Real-Time' : 'Async'
      const confirmation = confirm(`Are you sure you want to`
        + ` permanently delete the ${type} portion of your meeting?`
        + ` This will delete all student submissions.`)
      if(!confirmation)
        return

      try {
        const tasks = this.getTasksWithSubmissionIds(is_real_time)
        if(is_real_time) {
          await RealTimePortionAPI.deleteRealTimePortion(
            this.meeting.real_time_portion._id, this.meeting._id,
            tasks)
        } else {
          await AsyncPortionAPI.deleteAsyncPortion(
            this.meeting.async_portion._id, this.meeting._id,
            tasks)
        }
        this.removePortionFromCourse(is_real_time)
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong")
      }
    },
    getTasksWithSubmissionIds(is_real_time) {
      let tasks_with_submission_ids = []
      let meeting_tasks;
      if(is_real_time) {
        meeting_tasks =
          this.meeting.real_time_portion.qr_scans
      } else {
        meeting_tasks =
          this.meeting.async_portion.videos
      }
      for(let i = 0; i < meeting_tasks.length; i++) {
        const submission_ids = this.getSubmissionIds(i,
          is_real_time)
        tasks_with_submission_ids.push({
          _id: meeting_tasks[i]._id,
          submission_ids: submission_ids
        })
      }
      return tasks_with_submission_ids
    },
    removePortionFromCourse(is_real_time) {
      if(is_real_time) {
        this.meeting.real_time_portion = null
        this.meeting_copy.real_time_portion = null
      } else {
        this.meeting.async_portion = null
        this.meeting_copy.async_portion = null
      }
    },
    async promptMeetingDeletion() {
      const confirmation = confirm(`Are you sure you want to`
        + ` permanently delete this meeting?`
        + ` This will delete all student submissions.`)
      if(!confirmation)
        return

      if(this.meeting.recurring_id != null) {
        this.$refs.MeetingDeletionModal.showModal()
      } else {
        this.deleteMeeting(false)
      }
    },
    async deleteMeeting(delete_all_recurring) {
      try {
        if(delete_all_recurring) {
          await MeetingAPI.deleteAllRecurringMeetings(
            this.meeting.recurring_id)
        } else {
          let real_time_portion_id = null
          let qr_scans = []
          if(this.meeting.real_time_portion != null){
            real_time_portion_id =
              this.meeting.real_time_portion._id
            qr_scans = this.getTasksWithSubmissionIds(
              true)
          }
          let async_portion_id = null
          let videos = []
          if(this.meeting.async_portion != null){
            async_portion_id =
              this.meeting.async_portion._id
            videos = this.getTasksWithSubmissionIds(
              false)
          }
          await MeetingAPI.deleteMeeting(this.meeting._id,
            real_time_portion_id, async_portion_id, qr_scans,
            videos)
        }
        console.log("here, pushing")
        this.$router.push({name: 'course_info',
          params: {id: this.meeting.sections[0].course._id}})
      } catch (error) {
        console.log("error", error)
        alert("Sorry, something went wrong")
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