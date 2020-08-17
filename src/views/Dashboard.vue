<template>
  <div id="dashboard-container">
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
            <div class="title-subvalue">{{this.live_meetings.length}}  live meetings</div>
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
<!--                   <MeetingInfoPill
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
                /> -->
                </div>
            </div>
          </transition>
        </div>
        <div class="dashboard-section">
        <div class="section-title">
          <div class="title-value">Asynchronous</div>
          <div class="title-subvalue">{{this.async_meetings.length}} asynchronous meetings</div>
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

   <!--              <MeetingInfoPill
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
                /> -->
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
        current_user: {},
        user_has_loaded: false,
        user_meetings : [],
        live_meetings: [],
        async_meetings: [],
        all_lectures: [],
        live_lectures: [],
        live_lectures_exist: Boolean,
        playback_lectures: [],
        playback_lectures_exist: Boolean,
        recent_lectures: [],
        recent_lectures_exist: Boolean,
        upcoming_lectures: [],
        upcoming_lectures_exist: Boolean,
        courses_loaded: Number,
        courses: Object,
        STATIC_COURSE_COLORS: Array,
        live_lectures_loaded: false,
        upcoming_lectures_loaded: Boolean,
        recent_lectures_loaded: Boolean,
        playback_lectures_loaded: Boolean,
        section_1: String,
        section_2: String
      }
    },
    created() {
      this.STATIC_COURSE_COLORS = ['Aquamarine', 'Tomato', 'LightSalmon', 'Cyan', 'MediumTurquoise', 'PaleGreen', 'pink', 'violet', ]
      this.courses_loaded = 0

      this.live_lectures_loaded = false
      this.upcoming_lectures_loaded = false
      this.recent_lectures_loaded = false
      this.playback_lectures_loaded = false

      this.getCurrentUser()
      // this.getAllLecturesForUser()
    },
    methods: {
      async getCurrentUser() {
        this.current_user = this.$store.state.user.current_user
        this.is_instructor = this.current_user.is_instructor
        const response = await UserAPI.getUser(this.current_user._id)
        let user = response.data
        this.user_has_loaded = true
        this.user_meetings = user.meetings
        console.log("user meetings",this.user_meetings)
        this.getLiveMeetings()
        this.getAsyncMeetings()
      },
      getLiveMeetings() {
        let current_time = new Date()
        this.user_meetings.forEach(meeting => {
          if(current_time >= new Date(meeting.start_time) && 
            current_time <= new Date(meeting.end_time))
            this.live_meetings.push(meeting)
        })
      },
      getAsyncMeetings() {
        this.user_meetings.forEach(meeting => {
          if(meeting.has_async_attendance)
            this.async_meetings.push(meeting)
        })
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
      setCourses (courses_data) {
        let course_dict = {}
        courses_data.forEach((course_, i) => {
          if (course_ != null && course_.hasOwnProperty('_id')) {
            course_dict[course_._id] = course_
            course_dict[course_._id]["color_index"] = i
          }
        })
        this.courses = course_dict

      },
      logOut() {
        this.$store.dispatch('logout')
      },
      setCourseSize (_size_) {
        this.courses_loaded = _size_
      },
      async getAllLecturesForUser() {
        const response = await LectureAPI.getLecturesForUser(this.current_user._id, "with_sections_and_course")
        this.parseLiveLectures(response.data)
        this.parsePlaybackLectures(response.data)
        this.parseRecentLectures(response.data)
        this.parseUpcomingLectures(response.data)
        this.chooseLecturesToDisplay()
      },
      parseLiveLectures(all_lectures) {
        this.live_lectures = getLiveLectures(all_lectures)
        this.setcheckinWindowStatusesForLiveLectures()
        this.sortLiveLecturesByCheckinWindowStatus()
        this.live_lectures_loaded = true
        this.live_lectures_exist = this.live_lectures.length > 0
      },
      parsePlaybackLectures(all_lectures) {
        this.playback_lectures = getActivePlaybackLectures(all_lectures)
        this.playback_lectures_loaded = true
        this.playback_lectures_exist = this.playback_lectures.length > 0
      },
      parseRecentLectures(all_lectures) {
        this.recent_lectures = getRecentLectures(all_lectures)
        this.recent_lectures_loaded = true
        this.recent_lectures_exist = this.recent_lectures.length > 0
      },
      parseUpcomingLectures(all_lectures) {
        this.upcoming_lectures = getUpcomingLectures(all_lectures)
        this.upcoming_lectures_loaded = true
        this.upcoming_lectures_exist = this.upcoming_lectures.length > 0
      },
      setcheckinWindowStatusesForLiveLectures() {
        this.live_lectures.forEach(lecture => {
          this.setCheckinWindowStatus(lecture)
        })
      },
      setCheckinWindowStatus(lecture) {
        let current_time = new Date()
        let found_open_checkin_window = false
        for(let i = 0; i < lecture.checkins.length; i++) {
          let current_checkin = lecture.checkins[i]
          let current_checkin_start_time = new Date(current_checkin.start_time)
          let current_checkin_end_time = new Date(current_checkin.end_time)
          if(current_time >= current_checkin_start_time && current_time <= current_checkin_end_time){
            lecture.checkin_window_status = "open"
            lecture.checkin_index = i
            lecture.current_checkin = current_checkin
            found_open_checkin_window = true
            break
          }
        }
        if(!found_open_checkin_window)
          lecture.checkin_window_status = "closed"
      },
      sortLiveLecturesByCheckinWindowStatus() {
        let temp_list = []
        this.live_lectures.forEach(lecture => {
          if(lecture.checkin_window_status === "open")
            temp_list.unshift(lecture)
          else
            temp_list.push(lecture)
        })
        this.live_lectures = temp_list
      },
      chooseLecturesToDisplay() {
        let lecture_existence_pairs = [["live", this.live_lectures_exist], ["playback", this.playback_lectures_exist],
          ["recent", this.recent_lectures_exist], ["upcoming", this.upcoming_lectures_exist]]
        let found_first_type = false
        for(let i = 0; i < lecture_existence_pairs.length; i++) {
          let pair = lecture_existence_pairs[i]
          let lecture_type = pair[0]
          let lecture_existence_status = pair[1]
          if(lecture_existence_status) {
            if(!found_first_type) {
              this.section_1 = lecture_type
              found_first_type = true
            } else if(found_first_type) {
              this.section_2 = lecture_type
              break
            }
          }
        }
      }
    }
  }
</script>

<style scoped>
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
