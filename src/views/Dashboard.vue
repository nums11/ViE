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
    <div id="courses-section-container">
      <h2 id="courses-header">Courses 
        <span class="count">({{ user_courses.length}})</span>
      </h2>
      <div id="course-enrollment-link">
        <Button v-if="is_instructor" route_name="register_course"
        text="Register New Course" color="pink" size="small" wide/>
        <Button v-else route_name="join_course"
        text="Join Course" color="pink" size="small" wide/>
      </div>
      <div id="course-list-container">
          <DashboardCourseCard v-for="course in user_courses"
          :key="course._id" :course="course" />
      </div>
    </div>
  </div>
</template>

<script>
import UserAPI from '@/services/UserAPI.js';
import {showAt, hideAt} from 'vue-breakpoints'
import SquareLoader from "@/components/Loaders/SquareLoader.vue"
import DashboardMeetingsSection from "@/components/DashboardMeetingsSection.vue"
import DashboardCourseCard from "@/components/DashboardCourseCard.vue"
import moment from 'moment'
import Button from '@/components/Button'
import helpers from '@/helpers.js'

export default {
  name: 'Dashboard',
  mixins: [helpers],
  components: {
    hideAt,
    showAt,
    SquareLoader,
    DashboardMeetingsSection,
    Button,
    DashboardCourseCard
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
    this.assignUserCourses()
  },
  methods: {
    async getUser() {
      this.user_object_id = this.state_user._id
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
  padding-bottom: 2rem;
}

#meetings-section-container {
  margin-top: 3rem;
}

/deep/ .count {
  font-weight: normal;
  font-size: 1.5rem;
  margin-left: 0.25rem;
}

#courses-section-container {
  margin-top: 6rem;
}

#courses-header {
  width: 31%;
  text-align: center;
  display: inline-block;
  vertical-align: top;
}

#course-enrollment-link {
  display: inline-block;
  vertical-align: top;
  float: right;
  width: 33.3%;
  text-align: center;
  padding-top: 0.5rem;
}

#course-list-container {
  width: 97.5%;
  margin: auto;
  margin-top: 2rem;
  overflow-x: auto;
  white-space: nowrap;
  padding-bottom: 1rem;
}

/* Phones */
@media (max-width: 744px) {
  #courses-header {
    width: 100%;
  }
  #course-enrollment-link {
    width: 100%;
    float: none;
  }
  #course-list-container {
    width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    max-height: 20rem;
  }
}
</style>
