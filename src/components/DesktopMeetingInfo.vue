<template>
  <div id="meeting-info">
    <FullScreenQRCodeModal v-if="show_full_screen_code"
      v-on:hide-modal="hideFullScreenQRCodeModal"
      :qr_scan="full_screen_qr_scan"
      :student_ids="meeting_students"
    />

    <div v-if="deleting_meeting">
      <sui-loader active>
        Deleting Meeting...
      </sui-loader>
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
          :meeting_students="meeting_students"
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
          :meeting_students="meeting_students" />
          <div v-else-if="active_section === 'Statistics'"
          key="statistics">
            <h1>Coming Soon</h1>
          </div>
          <div v-else-if="active_section === 'Settings'"
          key="settings">
            <MeetingSettingsContainer :meeting="meeting"
            v-on:show-deleting-meeting-loader="
            toggleDeletingMeetingLoader(true)"
            v-on:hide-deleting-meeting-loader="
            toggleDeletingMeetingLoader(false)"/>
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
  name: 'DesktopMeetingInfo',
  mixins: [helpers],
  components: {
    SideBar,
    FullScreenQRCodeModal,
    MeetingInfoPortionContainer,
    MeetingSettingsContainer
  },
  props: {
    meeting: {
      type: Object,
      required: true
    },
    meeting_course: {
      type: Object,
      required: true
    },
    meeting_students: {
      type: Set,
      required: true
    }
  },
  data () {
    return {
      sidebar_sub_headers: [],
      deleting_meeting: false,
      active_section: "Real-Time Portion",
      links: [
        {
          link_name: "Real-Time Portion",
          icon_name: "podcast"
        },
        {
          link_name: "Async Portion",
          icon_name: "clock"
        }
      ],
      show_qr_scanning_window: false,
      full_screen_qr_scan: null,
      show_full_screen_code: false,
    }
  },
  created () {
    this.setSideBarSubHeadersAndLinks()
  },
  methods: {
    showSection(section_name) {
      this.active_section = section_name
    },
    setSideBarSubHeadersAndLinks() {
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
      if(this.is_instructor) {
        this.links.push({
          link_name: "Statistics",
          icon_name: "chart bar"
        })
        this.links.push({
          link_name: "Settings",
          icon_name: "cog"
        })
      }
    },
    showFullScreenQRCodeModal(qr_scan) {
      this.full_screen_qr_scan = qr_scan
      this.show_qr_code_modal = true
    },
    hideFullScreenQRCodeModal(submissions) {
      this.full_screen_qr_scan.submissions = submissions
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
    },
    toggleDeletingMeetingLoader(value) {
      this.deleting_meeting = value
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