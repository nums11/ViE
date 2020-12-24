<template>
  <div id="dashboard">
    <div id="meetings-section-container">
      <DashboardMeetingsSection section_type="real_time"
      :meetings="real_time_meetings" />
      <DashboardMeetingsSection section_type="recent_real_time"
      :meetings="recent_real_time_meetings" />
      <DashboardMeetingsSection section_type="async"
      :meetings="async_meetings" />
    </div>
    <div id="courses-section-container"></div>
  </div>
</template>

<script>
import UserAPI from '@/services/UserAPI.js';
import {showAt, hideAt} from 'vue-breakpoints'
import SquareLoader from "@/components/Loaders/SquareLoader.vue"
import DashboardMeetingsSection from "@/components/DashboardMeetingsSection.vue"
import moment from 'moment'

export default {
  name: 'Dashboard',
  components: {
    hideAt,
    showAt,
    SquareLoader,
    DashboardMeetingsSection
  },
  data(){
    return {
      user: {},
      user_has_loaded: false,
      real_time_meetings: [],
      recent_real_time_meetings: [],
      async_meetings: [],
      courses: Object,
    }
  },
  async created() {
    await this.getUser()
    this.categorizeMeetings()
  },
  methods: {
    async getUser() {
      this.user_object_id = this.$store.state.user.current_user._id
      console.log("User user_object_id", this.user_object_id)
      try {
        const response = await UserAPI.getUserWithMeetings(this.user_object_id)
        this.user = response.data
      } catch(error) {
        console.log(error)
        alert("Sorry something went wrong")
      }
    },
    categorizeMeetings() {
      this.user.meetings.forEach(meeting => {
        let now = Date.now()
        if(this.meetingIsRealTime(meeting, now))
          this.real_time_meetings.push(meeting)
        else if(this.meetingWasRecentlyRealTime(meeting, now))
          this.recent_real_time_meetings.push(meeting)
        if(this.meetingIsAsync(meeting, now))
          this.async_meetings.push(meeting)
      })
    },
    meetingIsRealTime(meeting, now) {
      if(!meeting.has_live_attendance)
        return false
      return moment(now).isBetween(meeting.start_time, meeting.end_time)
    },
    meetingWasRecentlyRealTime(meeting, now) {
      const twenty_four_hours_ago = moment().subtract(24, 'hours')
      return moment(meeting.end_time).isBetween(twenty_four_hours_ago, now)
    },
    meetingIsAsync(meeting, now) {
      let is_async = false
      for(let i = 0; i < meeting.async_attendance.recordings.length;
        i++) {
        const recording = meeting.async_attendance.recordings[i]
        if(moment(now).isBetween(recording.recording_submission_start_time,
          recording.recording_submission_end_time)) {
          is_async = true
          break
        }
      }
      return is_async
    }
  }
}
</script>

<style scoped>
#dashboard {
  width: 90%;
  margin: auto;
}

#meetings-section-container {
  /*border: green solid;*/
  margin-top: 3rem;
}
</style>
