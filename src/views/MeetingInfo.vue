<template>
  <div>
    <div v-if="!meeting_has_loaded">
      <sui-loader active>
        {{!meeting_has_loaded ? "Loading": "Deleting"}}
        Meeting...
      </sui-loader>
    </div>
    <div v-else>
      <hide-at breakpoint="small">
        <DesktopMeetingInfo :meeting="meeting"
        :meeting_course="meeting_course"
        :meeting_students="meeting_students" />
      </hide-at>
      <show-at breakpoint="small">
        <MobileMeetingInfo
        :meeting="meeting"
        :meeting_course="meeting_course" />
      </show-at>
    </div>
  </div>
</template>

<script>
import MeetingAPI from '@/services/MeetingAPI'
import DesktopMeetingInfo from
'@/components/DesktopMeetingInfo'
import MobileMeetingInfo from
'@/components/MobileMeetingInfo'
import helpers from '@/helpers.js'

export default {
  name: 'MeetingInfo',
  mixins: [helpers],
  components: {
    DesktopMeetingInfo,
    MobileMeetingInfo
  },
  data () {
    return {
      meeting: {},
      meeting_course: {},
      meeting_students: [],
      meeting_has_loaded: false,
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
        this.meeting_course = this.meeting.sections[0].course
        this.meeting_students = this.getMeetingStudents(this.meeting)
        this.meeting_has_loaded = true
      } catch(error) {
        console.log(error)
        window.alert("Sorry something went wrong")
      }
    },
  }
}
</script>

<style scoped>
</style>