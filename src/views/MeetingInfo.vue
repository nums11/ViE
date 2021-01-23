<template>
  <div id="meeting-info">
    <FullScreenQRCodeModal v-if="show_full_screen_code"
      v-on:hide-modal="hideFullScreenQRCodeModal"
      :qr_scan="full_screen_qr_scan"
      :student_ids="meeting_student_ids"
    />

    <div v-if="!meeting_has_loaded">
      <sui-loader active />
    </div>
    <div v-else>
      <SideBar :header="meeting.title"
      :sub_headers="sidebar_sub_headers"
      :links="links"
      v-on:show-section="showSection" />
      <div class="inline-block" id="main">
        <transition name="fade" mode="out-in">
          <MeetingInfoPortionContainer
          v-if="active_section === 'Real-Time Portion'"
          key="real-time portion"
          ref="RealTimePortionContainer"
          :meeting_id="meeting._id"
          :portion="meeting.real_time_portion"
          :meeting_student_ids="meeting_student_ids"
          :instructor_id="meeting.sections[0].course.instructor._id"
          v-on:show-qr="showQRScanningWindow"
          v-on:set-new-portion="setNewPortion(true, ...arguments)"
          is_real_time />
          <MeetingInfoPortionContainer
          v-else-if="active_section === 'Async Portion'"
          key="async portion"
          ref="AsyncPortionContainer"
          :meeting_id="meeting._id"
          :portion="meeting.async_portion"
          v-on:set-new-portion="setNewPortion(false, ...arguments)"
          :meeting_student_ids="meeting_student_ids" />
          <div v-else-if="active_section === 'Statistics'"
          key="statistics">
            <h1>Coming Soon</h1>
          </div>
          <div v-else-if="active_section === 'Settings'"
          key="settings">
            <MeetingSettingsContainer :meeting="meeting" />
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import SideBar from '@/components/SideBar'
import MeetingAPI from '@/services/MeetingAPI'
import FullScreenQRCodeModal from
'@/components/FullScreenQRCodeModal.vue';
import MeetingInfoPortionContainer from
'@/components/MeetingInfoPortionContainer.vue';
import MeetingSettingsContainer from
'@/components/MeetingSettingsContainer'
import helpers from '@/helpers.js'

export default {
  name: 'MeetingInfo',
  mixins: [helpers],
  components: {
    SideBar,
    FullScreenQRCodeModal,
    MeetingInfoPortionContainer,
    MeetingSettingsContainer
  },
  data () {
    return {
      meeting: {},
      meeting_course: {},
      meeting_student_ids: [],
      sidebar_sub_headers: [],
      meeting_has_loaded: false,
      active_section: "Real-Time Portion",
      links: [
        {
          link_name: "Real-Time Portion",
          icon_name: "podcast"
        },
        {
          link_name: "Async Portion",
          icon_name: "clock"
        },
        {
          link_name: "Statistics",
          icon_name: "chart bar"
        },
        {
          link_name: "Settings",
          icon_name: "cog"
        }
      ],
      show_qr_scanning_window: false,
      full_screen_qr_scan: null,
      show_full_screen_code: false,
    }
  },
  created () {
    this.getMeeting()
  },
  methods: {
    async getMeeting() {
      try {
        this.meeting_id = this.$route.params.meeting_id
        const response = await MeetingAPI.getMeeting(this.meeting_id)
        this.meeting = response.data
        console.log("Meeting", this.meeting)
        this.meeting_course = this.meeting.sections[0].course
        this.setSideBarSubHeaders()
        this.meeting_student_ids = this.getMeetingStudentIDs(this.meeting)
        this.meeting_has_loaded = true
      } catch(error) {
        console.log(error)
        alert("Sorry something went wrong")
      }
    },
    showSection(section_name) {
      this.active_section = section_name
    },
    setSideBarSubHeaders() {
      this.sidebar_sub_headers.push(this.meeting_course.name)
      let sections_sub_header = 
        `Section${this.meeting.sections.length > 1 ? 's' : ''} `
      let i = 0
      this.meeting.sections.forEach(section => {
        sections_sub_header += `${section.section_number}`
        if(i != this.meeting.sections.length - 1)
          sections_sub_header += ','
        i++
      })
      this.sidebar_sub_headers.push(sections_sub_header)
    },
    showFullScreenQRCodeModal(qr_scan) {
      this.full_screen_qr_scan = qr_scan
      this.show_qr_code_modal = true
    },
    hideFullScreenQRCodeModal() {
      this.show_full_screen_code = false
      this.full_screen_qr_scan = null
    },
    showQRScanningWindow(qr_scan) {
      this.full_screen_qr_scan = qr_scan
      this.show_full_screen_code = true
    },
    setNewPortion(is_real_time, portion) {
      if(is_real_time){
        this.meeting.real_time_portion = portion
        this.$refs.RealTimePortionContainer.
          setPortionTimesAndTasks()
      } else {
        this.meeting.async_portion = portion
        this.$refs.AsyncPortionContainer.
          setPortionTimesAndTasks()
      }
    }
  }
}
</script>

<style scoped>
#meeting-info {
  margin-top: 3rem;
  /*border: blue solid;*/
  min-height: 47rem;
  padding-left: 5rem;
  padding-right: 5rem;
  padding-bottom: 2rem;
}

#main {
  /*border: red solid;*/
  padding-top: 0.5rem;
  width: 79%;
  height: 100%;
}

#section-header {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

.no-portion-text {
  text-align: center;
  font-weight: bold;
  font-size: 1.75rem;
  margin-top: 14rem;
}
</style>