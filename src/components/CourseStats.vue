<template>
  <div class="course-stats">
    <sui-loader v-if="!populated_meetings_loaded"
    active size="medium">
      Calculating Statistics...
    </sui-loader>
    <sui-tab v-else>
      <sui-tab-pane class="stats-pane" title="Course Averages">
        <CourseAverages :meetings="populated_meetings" />
      </sui-tab-pane>
      <sui-tab-pane class="stats-pane" title="Attendance By Meeting">
        <CourseAttendanceTable :meetings="populated_meetings"
        :course="course" />
      </sui-tab-pane>
      <sui-tab-pane class="stats-pane" title="Percentiles">
        Coming Soon...
      </sui-tab-pane>
      <sui-tab-pane class="stats-pane" title="Engagement Warnings">
        Coming Soon...
      </sui-tab-pane>
    </sui-tab>
  </div>
</template>

<script>
import CourseAverages from '@/components/CourseAverages'
import CourseAttendanceTable from
'@/components/CourseAttendanceTable'
import MeetingAPI from '@/services/MeetingAPI'
import helpers from '@/helpers'

export default {
  name: 'CourseStats',
  mixins: [helpers],
  props: {
    meetings: {
      type: Array,
      required: true
    },
    course: {
      type: Object,
      required: true
    }
  },
  components: {
    CourseAttendanceTable,
    CourseAverages
  },
  data () {
    return {
      populated_meetings: [],
      populated_meetings_loaded: false
    }
  },
  created () {
    this.getPopulatedMeetings()
  },
  methods: {
    async getPopulatedMeetings() {
      try {
        const meeting_ids = this.getObjectIdsFromObjects(
          this.meetings)
        const response = await MeetingAPI.getPopulatedMeetings(
          meeting_ids)
        this.populated_meetings = response.data
        this.populated_meetings_loaded = true
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong")
      }
    }
  }
}
</script>

<style scoped>
.stats-pane {
  height: 40rem;
  overflow-y: auto;
}
</style>