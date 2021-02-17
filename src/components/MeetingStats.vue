<template>
  <div>
    <div>
      <div class="percent-container inline-block center-text">
        <h3 class="navy-blue">
          Overall Attendance Percentage
        </h3>
        <p>
          Percentage of students who submitted to
          at least 1 task.
        </p>
        <p class="percent">{{ overall_percent.toFixed(1) }}%</p>
      </div>
      <div class="ml-2 percent-container inline-block center-text">
        <h3 class="navy-blue">
          Real-Time Attendance Percentage
        </h3>
        <p>
          Percentage of students who submitted to at least
          1 real-time task.
        </p>
        <p class="percent">{{ real_time_percent.toFixed(1) }}%</p>
      </div>
      <div class="ml-2 percent-container inline-block center-text">
        <h3 class="navy-blue">
          Async Attendance Percentage
        </h3>
        <p>
          Percentage of students who submitted to at least
          1 async task.
        </p>
        <p class="percent">{{ async_percent.toFixed(1) }}%</p>
      </div>
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
    MeetingSubmissionTable
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