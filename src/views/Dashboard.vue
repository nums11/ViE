<template>
  <div class="dashboard-page">

    <div class="instructor-action-row" v-if="current_user.is_instructor">
      <sui-dropdown
        class="labeled
        icon venue-green"
          icon="plus"
          button
          text="Create New Meeting"
        >
        <sui-dropdown-menu>
          
          <sui-dropdown-item v-for="course in courses"><router-link :to="`/new_meeting/course/${course._id}`"><div>{{course.name}}</div></router-link></sui-dropdown-item>
       </sui-dropdown-menu>
      </sui-dropdown>
    </div>
    <div class="dashboard-row-one dashboard-row">
      <div class="dashboard-section">
        <div class="section-title">
          <div class="title-value">Live</div>
          <div class="title-subvalue">{{getLiveMeetingCount ()}}  live meetings</div>
        </div>
          <div v-if="!live_loaded">
            <div :style="{marginTop: '30px', marginBottom: '80px'}"><SquareLoader /></div>
          </div>
          <transition
              name="fade"
              mode="out-in"
            >
            <div v-if="live_loaded">
              <div v-for="(meeting, i) in meetings" :key="i">
                <MeetingInfoPill
                v-if="meeting.has_live_attendance"
                v-bind:meetingMeta='{
                  meetingTitle: meeting.title,
                  courseDept: `${meeting.course.dept} ${meeting.course.course_number}`,
                  courseName: meeting.course.name
                }'
                :meetingId="meeting._id"
                v-bind:tasks='{
                  qrCode: true,
                  poll: true
                }'
              />
              </div>
          </div>
        </transition>
      </div>
      <div class="dashboard-section">
      <div class="section-title">
        <div class="title-value">Asynchronous</div>
        <div class="title-subvalue">{{getAsyncMeetingCount ()}} asynchronous meetings</div>
      </div>
          <div v-if="!async_loaded">
              <div :style="{marginTop: '30px', marginBottom: '80px'}"><SquareLoader /></div>
          </div>
          <transition
              name="fade"
              mode="out-in"
            >
          <div v-if="async_loaded">
            <div v-for="(meeting, i) in meetings" :key="i">
              <MeetingInfoPill
              v-if="meeting.has_async_attendance"
              v-bind:meetingMeta='{
                meetingTitle: meeting.title,
                courseDept: `${meeting.course.dept} ${meeting.course.course_number}`,
                courseName: meeting.course.name
                }'
                :meetingId="meeting._id"
                v-bind:tasks='{
                  recording: true,
                  fileDownload: true
                }'
              />
            </div>
          </div>
        </transition>
      </div>
    </div>

  </div>

</template>

<script>

  import SquareLoader from "@/components/Loaders/SquareLoader.vue"
  import MeetingInfoPill from '@/components/MeetingInfoPill.vue'
  import { authComputed } from '../vuex/helpers.js'
  import CourseAPI from "@/services/CourseAPI"
  import MeetingAPI from "@/services/MeetingAPI"

  export default {
    name: 'Dashboard',
    computed: {
      ...authComputed
    },
    components: {
      MeetingInfoPill,
      SquareLoader,
    },
    data(){
      return {
        async_loaded: false,
        live_loaded: false,
        courses: [],
        meetings: []
      }
    },
    created() {
      this.getCurrentUser()
      this.getCourses()
    },
    methods: {

      hasLivePolls (meeting_info) {
        if (Object.prototype.hasOwnProperty.call(meeting_info, 'live_attendance')) {
          if (meeting_info.live_attendance.live_polls != undefined) return true
        }
      },
      hasQRCheckin (meeting_info) {

      },

      getAsyncMeetingCount () {
        let count = 0
        this.meetings.forEach(meeting => {
          if (meeting.has_async_attendance) ++ count
        })
        return count
      },
      getLiveMeetingCount () {
        let count = 0
        this.meetings.forEach(meeting => {
          if (meeting.has_live_attendance) ++ count
        })
        return count
      },
      getMeetingData (meeting_id) {
        console.log(`Fetching meeting data for: ${meeting_id}`)

        return MeetingAPI.getMeeting(meeting_id)
        .then(res => {
          this.meetings.push(res.data)
          console.log(this.meetings)
        })
      },
      getCourses () {

        if (this.current_user.is_instructor) {
          CourseAPI.getInstructorCourses (this.current_user._id)
          .then (res => {
            if (res.data)
              this.courses = res.data
              // console.log(res)

              // Fetch the information for each meeting
              let promises_ = []
              for (var i = 0; i < res.data.length; ++i) {
                for (var j = 0; j < res.data[i].meetings.length; ++j) {
                  promises_.push( this.getMeetingData( res.data[i].meetings[j] ) );
                }
              }

              Promise.all(promises_)
              .then(result => {
                console.log(`All meetings loaded`)
                this.async_loaded = true
                this.live_loaded = true
              })
              
          })
        }
      },
      getCurrentUser() {
        this.current_user = this.$store.state.user.current_user
      },

      // TODO NUMFOR
      userCourses () {
        /*
        Should return a list of all the courses for the currently logged in user (student/instructor).
        
        */
      },
      liveMeetings () {
        /*
        Should return a list of meetings that have a live attendance component, along with their corresponding
        LiveAttendance component.
        */

      },
      asyncMeetings () {
        /*
        Should return a list of meetings that have an async attendance component, along with their corresponding
        AsyncAttendance component.
        */

      }
    } // end methods
  }
</script>

<style lang="scss">
 
.dashboard-page {
  .instructor-action-row {
    height: 50px;
    vertical-align: bottom;
    display: flex;
    align-items: flex-end;
    margin-bottom: 30px;
  }
}

.dashboard-page .dashboard-row {
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
