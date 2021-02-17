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
    this.calculatePercentages()
  },
  methods: {
    calculatePercentages() {
      if(this.meeting_students.size === 0)
        return

      const num_students = this.meeting_students.size
      let submitter_user_ids = new Set()

      if(this.meeting.real_time_portion != null) {
        const qr_scans = this.meeting.real_time_portion.qr_scans
        let submitter_user_ids_for_qr_scans =
          this.getSubmitterUserIDsForTasks(qr_scans)
        const quizzes = this.meeting.real_time_portion.quizzes
        let submitter_user_ids_for_quizzes =
          this.getSubmitterUserIDsForTasks(quizzes)
        submitter_user_ids = new Set([...submitter_user_ids_for_qr_scans,
          ...submitter_user_ids_for_quizzes])
        this.real_time_percent =
          (submitter_user_ids.size / num_students) * 100
      }
      if(this.meeting.async_portion != null) {
        const videos = this.meeting.async_portion.videos
        let submitter_user_ids_for_videos =
          this.getSubmitterUserIDsForTasks(videos)
        submitter_user_ids = new Set([...submitter_user_ids,
          ...submitter_user_ids_for_videos])
        this.async_percent =
          (submitter_user_ids_for_videos.size / num_students) * 100
      }

      this.overall_percent =
        (submitter_user_ids.size / num_students) * 100
      this.getPresentAndAbsentStudentsForMeeting(submitter_user_ids)
    },
    getSubmitterUserIDsForTasks(tasks) {
      const tasks_submitter_user_ids = new Set()
      tasks.forEach(task => {
        let students = this.getPresentAndAbsentStudents(
          this.meeting_students, task)
        let present_students = students.present_students
          this.addStudentUserIDsToSet(tasks_submitter_user_ids, present_students)
      })
      return tasks_submitter_user_ids
    },
    addStudentUserIDsToSet(set, students) {
      students.forEach(student => {
        set.add(student.user_id)
      })
    },
    getPresentAndAbsentStudentsForMeeting(submitter_user_ids) {
      this.meeting_students.forEach(student => {
        if(submitter_user_ids.has(student.user_id))
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