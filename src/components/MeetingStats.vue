<template>
  <div>
    <div>
      <Metric
      header="Overall Attendance Percentage"
      sub_header="Percentage of students who submitted to
      at least 1 task."
      :percentage="overall_percent.toFixed(1)"
      size="medium" />
      <Metric class="ml-3"
      header="Real-Time Attendance Percentage"
      sub_header="Percentage of students who submitted to
      at least 1 real-time task."
      :percentage="real_time_percent.toFixed(1)"
      size="medium" />
      <Metric class="ml-3"
      header="Async Attendance Percentage"
      sub_header="Percentage of students who submitted to at least
      1 async task."
      :percentage="async_percent.toFixed(1)"
      size="medium" />
    </div>
    <div class="mt-2" v-if="students_loaded">
      <MeetingSubmissionTable :meeting="meeting"
      :meeting_students="meeting_students"
      :present_students="present_students"
      :absent_students="absent_students" />
    </div>
  </div>
</template>

<script>
import MeetingSubmissionTable from
'@/components/MeetingSubmissionTable'
import Metric from '@/components/Metric'
import helpers from '@/helpers.js'

export default {
  name: 'MeetingStats',
  mixins: [helpers],
  props: {
    meeting: {
      type: Object,
      required: true
    },
    meeting_students: {
      type: Set,
      required: true
    }
  },
  components: {
    MeetingSubmissionTable,
    Metric
  },
  data () {
    return {
      overall_percent: 0,
      real_time_percent: 0,
      async_percent: 0,
      present_students: [],
      absent_students: [],
      students_loaded: false
    }
  },
  created() {
    const meeting_percentages = this.calculateMeetingPercentages(
      this.meeting, this.meeting_students)
    this.real_time_percent = meeting_percentages.real_time_percent
    this.async_percent = meeting_percentages.async_percent
    this.overall_percent = meeting_percentages.overall_percent
    this.submitter_user_ids = meeting_percentages.submitter_user_ids
    this.getPresentAndAbsentStudentsForMeeting()
  },
  methods: {
    getPresentAndAbsentStudentsForMeeting() {
      this.meeting_students.forEach(student => {
        if(this.submitter_user_ids.has(student.user_id))
          this.present_students.push(student)
        else
          this.absent_students.push(student)
      })
      this.students_loaded = true
    }
  }
}
</script>

<style scoped>
.percent-container {
  width: 24rem;
  padding-left: 1rem;
  padding-right: 1rem;
}

#async-percent {
  margin-left: 2rem;
}

.percent {
  font-size: 7.5rem;
  font-weight: bold;
  color: #00B3FF;
  margin-bottom: 0;
}
</style>