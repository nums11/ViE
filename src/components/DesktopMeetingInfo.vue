<template>
  <div id="meeting-info">
    <FullScreenQRCodeModal v-if="show_full_screen_code"
      v-on:hide-modal="hideFullScreenQRCodeModal"
      :qr_scan="full_screen_qr_scan"
      :student_ids="meeting_students"
      :real_time_portion="meeting.real_time_portion"
    />
    <VueLottiePlayer v-if="show_lottie_player"
      :animationData="require('@/assets/lottie/uploading.json')"
      loop height="100%" width="100%" autoplay
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
          <DesktopMeetingInfoPortionContainer
          v-if="active_section === 'Real-Time Portion'"
          key="real-time portion"
          ref="RealTimePortionContainer"
          :meeting_id="meeting._id"
          :portion="meeting.real_time_portion"
          :meeting_students="meeting_students"
          :instructor_ids="getObjectIdsFromObjects(
          meeting_course.instructors)"
          v-on:show-lottie-player="showLottiePlayer"
          v-on:hide-lottie-player="hideLottiePlayer"
          v-on:show-qr="showQRScanningWindow"
          v-on:set-new-portion="setNewPortion(true, ...arguments)"
          is_real_time />
          <DesktopMeetingInfoPortionContainer
          v-else-if="active_section === 'Async Portion'"
          key="async portion"
          ref="AsyncPortionContainer"
          :meeting_id="meeting._id"
          :portion="meeting.async_portion"
          v-on:show-lottie-player="showLottiePlayer"
          v-on:hide-lottie-player="hideLottiePlayer"
          v-on:set-new-portion="setNewPortion(false, ...arguments)"
          :meeting_students="meeting_students" />
          <MeetingStats v-else-if="active_section === 'Statistics'"
          :meeting="meeting" :meeting_students="meeting_students"
          key="statistics" />
          <MeetingSettingsContainer
          v-else-if="active_section === 'Settings'"
          :meeting="meeting"
          v-on:show-deleting-meeting-loader="
          toggleDeletingMeetingLoader(true)"
          v-on:hide-deleting-meeting-loader="
          toggleDeletingMeetingLoader(false)"/>
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
import DesktopMeetingInfoPortionContainer from
'@/components/DesktopMeetingInfoPortionContainer.vue';
import MeetingSettingsContainer from
'@/components/MeetingSettingsContainer'
import helpers from '@/helpers.js'
import VueLottiePlayer from 'vue-lottie-player'
import MeetingStats from
'@/components/MeetingStats'

export default {
  name: 'DesktopMeetingInfo',
  mixins: [helpers],
  components: {
    SideBar,
    FullScreenQRCodeModal,
    DesktopMeetingInfoPortionContainer,
    MeetingSettingsContainer,
    VueLottiePlayer,
    MeetingStats
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
      show_lottie_player: false
    }
  },
  created () {
    if(this.$route.params.qr_scan_id) {
      const qr_scan = this.getQRScanByID(
        this.$route.params.qr_scan_id)
      console.log("qr_scan", qr_scan)
      if(qr_scan != null) {
        console.log("showing")
        this.showQRScanningWindow(qr_scan)
      }
    }
    this.setSideBarSubHeadersAndLinks()
  },
  methods: {
    getQRScanByID(qr_scan_id) {
      if(this.meeting.real_time_portion == null)
        return null

      let qr_scan = null
      const qr_scans = this.meeting.real_time_portion.qr_scans
      for(let i = 0; i < qr_scans.length; i++) {
        if(qr_scans[i]._id === qr_scan_id) {
          qr_scan = qr_scans[i]
          break
        }
      }
      return qr_scan
    },
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
      console.log("here")
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
    },
    showLottiePlayer() {
      this.show_lottie_player = true
    },
    hideLottiePlayer() {
      this.show_lottie_player = false
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

#lottie-player-container {
  position: fixed;
  width: 100%;
  height: 100%;
  margin-left: -7rem;
  margin-top: -2rem;
  z-index: 10;
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