<template>
  <div id="dashboard-container">
    <div class="dashboard-page">
      <div class="instructor-action-row" v-if="user.is_instructor">
<!--         <sui-dropdown
          class="labeled
          icon venue-green"
            icon="plus"
            button
            text="Schedule Meeting"
          >
          <sui-dropdown-menu>
            
            <sui-dropdown-item v-for="course in user.courses">
              <router-link :to="{name: 'course_info', params: { id: course._id }}"><div>{{course.name}}</div></router-link>
            </sui-dropdown-item>
         </sui-dropdown-menu>
        </sui-dropdown> -->
      </div>
      
      <div class="dashboard-row-one dashboard-row">
        <div class="dashboard-section">
          <div class="section-title">
            <div class="title-value">Live</div>
            <div class="title-subvalue" >({{live_meetings.length}}) meeting<span v-if="live_meetings.length != 1">s</span> with live attendance</div>
          </div>
            <div v-if="!user_has_loaded">
              <div :style="{marginTop: '30px', marginBottom: '80px'}"><SquareLoader /></div>
            </div>
            <transition
                name="fade"
                mode="out-in"
              >
              <div v-if="user_has_loaded">
                <div v-for="(meeting, i) in live_meetings" :key="i">
                  <MeetingInfoPill v-bind:meeting="meeting" />
                </div>
            </div>
          </transition>
        </div>
        <div class="dashboard-section">
        <div class="section-title">
          <div class="title-value">Asynchronous</div>
          <div class="title-subvalue">({{async_meetings.length}}) meeting<span v-if="async_meetings.length != 1">s</span> with asynchronous attendance</div>
        </div>
            <div v-if="!user_has_loaded">
                <div :style="{marginTop: '30px', marginBottom: '80px'}"><SquareLoader /></div>
            </div>
            <transition
                name="fade"
                mode="out-in"
              >
            <div v-if="user_has_loaded">
              <div v-for="(meeting, i) in async_meetings" :key="i">
                <MeetingInfoPill v-bind:meeting="meeting" />
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import UserAPI from '@/services/UserAPI.js';
  import {showAt, hideAt} from 'vue-breakpoints'
  import SquareLoader from "@/components/Loaders/SquareLoader.vue"
  import MeetingInfoPill from '@/components/MeetingInfoPill.vue'

  export default {
    name: 'Dashboard',
    components: {
      hideAt,
      showAt,
      MeetingInfoPill,
      SquareLoader
    },
    data(){
      return {
        user: {},
        user_has_loaded: false,
        user_meetings : [],
        live_meetings: [],
        async_meetings: [],
        upcoming_live_meetings: [],
        upcoming_async_meetings: [],
        courses: Object,
        STATIC_COURSE_COLORS: Array,
      }
    },
    async created() {
      this.STATIC_COURSE_COLORS = ['Aquamarine', 'Tomato', 'LightSalmon', 'Cyan', 'MediumTurquoise', 'PaleGreen', 'pink', 'violet', ]
      await this.getCurrentUser()
      this.categorizeMeetings()
    },
    methods: {
      async getCurrentUser() {
        this.user = this.$store.state.user.current_user
        this.is_instructor = this.user.is_instructor
        const response = await UserAPI.getUser(this.user._id)
        let user = response.data
        this.user_has_loaded = true
        this.user_meetings = user.meetings
      },
      categorizeMeetings() {
        this.user_meetings.forEach(meeting => {
          if(this.hasLive(meeting))
            this.live_meetings.push(meeting)
          if(this.hasAsync(meeting))
            this.async_meetings.push(meeting)
        })
      },
      hasLive(meeting) {
        if(!meeting.has_live_attendance)
          return false
        let current_time = new Date()
        let meeting_start_time = new Date(meeting.start_time)
        let meeting_end_time = new Date(meeting.end_time)
        return this.isBetweenTimes(current_time, meeting_start_time,
          meeting_end_time)
      },
      hasAsync(meeting) {
        if(!meeting.has_async_attendance)
          return false
        let has_open_recording_window = false
        let meeting_recordings = meeting.async_attendance.recordings
        let current_time = new Date()
        for(let i = 0; i < meeting_recordings.length; i++) {
          if(this.isBetweenTimes(current_time,
            new Date(meeting_recordings[i].recording_submission_start_time),
            new Date(meeting_recordings[i].recording_submission_end_time))){
            has_open_recording_window = true
            break            
          }
        }
        return has_open_recording_window
      },
      hasUpcomingLive(meeting) {
        if(!meeting.has_live_attendance)
          return false
        let current_time = new Date()
        let meeting_start_time = new Date(meeting.start_time)
        return this.isBeforeTime(current_time, meeting_start_time)
      },
      hasUpcomingAsync(meeting) {
        if(!meeting.has_async_attendance)
          return false
        let current_time = new Date()
        let has_upcoming_recording_window = false
        let meeting_recordings = meeting.async_attendance.recordings
        for(let i = 0; i < meeting_recordings.length; i++) {
          if(this.isBeforeTime(current_time,
            new Date(meeting_recordings[i].recording_submission_start_time))){
            has_upcoming_recording_window = true
            break            
          }
        }
        return has_upcoming_recording_window
      },
      isBeforeTime(time1, time2) {
        return time1 < time2
      },
      isBetweenTimes(time, start_time, end_time) {
        return (time >= start_time && time <= end_time)
      },
      getColor (course_info) {
        if (course_info == null || course_info._id == null) return 'grey'
        if (this.courses[ course_info._id ] == null || this.courses[ course_info._id ] == undefined) {
          // add the course and
          let next_color_index = 0;
          Object.keys(this.courses).forEach(course_ => {
            if (this.courses[course_].hasOwnProperty('color_index')) next_color_index = Math.max(next_color_index, this.courses[course_].color_index)
          })

          this.courses[course_info._id] = {
            color_index: next_color_index
          }
          return this.STATIC_COURSE_COLORS[next_color_index]

        }
        if (!this.courses[ course_info._id ].hasOwnProperty('color_index')) return 'grey'
        let color_index = this.courses[ course_info._id ].color_index
        if (color_index != null && color_index != undefined && color_index >= 0 && color_index < this.STATIC_COURSE_COLORS.length) {
          return this.STATIC_COURSE_COLORS[color_index]
        }
        return 'grey'
      },
    }
  }
</script>

<style scoped>

#dashboard-container {
  width: 89%;
  margin: auto;
}

.dashboard-page {
  margin-top: 1rem;
  .instructor-action-row {
    height: 50px;
    vertical-align: bottom;
    display: flex;
    align-items: flex-end;
    margin-bottom: 30px;
  }
}

.dashboard-page .dashboard-row {
  margin-top: 2rem;
  display: flex;
}

.dashboard-page .dashboard-row .dashboard-section {
  width: 50%;
  max-width: 700px;
  margin-bottom: 30px;
  box-sizing: border-box;
  padding-right: 20px;
}

.dashboard-page .dashboard-row .dashboard-section .section-title {
  height: 50px;
  font-weight: 600;
  font-size: 1.2rem;
  display: flex;
}

.dashboard-page .dashboard-row .dashboard-section .section-title .title-value {
  font-weight: 600;
  font-size: 1.2rem;
  margin-right: 20px;
}

.dashboard-page .dashboard-row .dashboard-section .section-title .title-subvalue {
  font-weight: 400;
  font-size: 1rem;
}

@media only screen and (max-width: 900px) {
  .dashboard-page .dashboard-row {
    display: block;
  }
  .dashboard-page .dashboard-row .dashboard-section {
    width: 100%;
    margin-bottom: 30px;
  }
}
</style>
