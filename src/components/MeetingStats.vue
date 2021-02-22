<template>
  <div>
    <div v-if="students_loaded" id="table-container">
      <MeetingSubmissionTable :meeting="meeting"
      :meeting_students="meeting_students"
      :present_students="present_students"
      :absent_students="absent_students" />
    </div>
    <Metric v-for="(metric,index) in metrics"
    :class="`mt-2 ${index % 3 !== 0 ? 'ml-3' : ''}`"
    :header="metric.header"
    :sub_header="metric.sub_header"
    :percentage="metric.percentage"
    size="medium" />
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
      average_qr_scan_submission_percent: 0,
      average_quiz_score: 0,
      average_video_submission_perent: 0,
      average_video_viewing_percent: 0,
      average_video_quiz_score: 0,
      present_students: [],
      absent_students: [],
      students_loaded: false,
      metrics: []
    }
  },
  created() {
    this.getMeetingPercentages()
    this.setMetrics()
    this.getPresentAndAbsentStudentsForMeeting()
  },
  methods: {
    getMeetingPercentages() {
      const meeting_percentages = this.calculateMeetingPercentages(
        this.meeting, this.meeting_students)
      this.real_time_percent = meeting_percentages.real_time_percent
      this.async_percent = meeting_percentages.async_percent
      this.overall_percent = meeting_percentages.overall_percent
      this.average_qr_scan_submission_percent =
        meeting_percentages.average_qr_scan_submission_percent
      this.average_quiz_score = meeting_percentages.average_quiz_score
      this.average_video_submission_perent =
        meeting_percentages.average_video_submission_perent
      this.average_video_viewing_percent =
        meeting_percentages.average_video_viewing_percent
      this.average_video_quiz_score =
        meeting_percentages.average_video_quiz_score
      this.submitter_user_ids = meeting_percentages.submitter_user_ids
    },
    setMetrics() {
      const meeting_task_types = this.getMeetingTaskTypes(
        this.meeting)
      if(meeting_task_types.has_tasks) {
        this.metrics.push({
          header: "Overall Attendance Percentage",
          sub_header: "Percentage of students who submitted to "
            + "at least 1 task.",
          percentage: this.overall_percent.toFixed(1)
        })
      }
      if(meeting_task_types.has_real_time_tasks) {
        this.metrics.push({
          header: "Real-Time Attendance Percentage",
          sub_header: "Percentage of students who submitted to "
            + "at least 1 real-time task.",
          percentage: this.real_time_percent.toFixed(1)
        })
      }
      if(meeting_task_types.has_async_tasks) {
        this.metrics.push({
          header: "Async Attendance Percentage",
          sub_header: "Percentage of students who submitted to "
            + "at least 1 async task.",
          percentage: this.async_percent.toFixed(1)
        })
      }
      if(meeting_task_types.has_qr_scans) {
        this.metrics.push({
          header: "Average QR Scan Submission Percentage",
          sub_header: "Average percentage of students who scan a qr.",
          percentage: ((this.average_qr_scan_submission_percent)
            * 100).toFixed(1)
        })
      }
      if(meeting_task_types.has_quizzes) {
        this.metrics.push({
          header: "Average Real-Time Quiz Score",
          sub_header: "Average student real-time quiz score.",
          percentage: this.average_quiz_score.toFixed(1)
        })
      }
      if(meeting_task_types.has_videos) {
        this.metrics.push({
          header: "Average Video Submission Percentage",
          sub_header: "Average percentage of students who watch a video",
          percentage: ((this.average_video_submission_perent)
            * 100).toFixed(1)
        })
        this.metrics.push({
          header: "Average Video Viewing Percentage",
          sub_header: "Average percent of videos that students view.",
          percentage: this.average_video_viewing_percent.toFixed(1)
        })
        if(meeting_task_types.has_video_quizzes) {
          this.metrics.push({
            header: "Average Video Quiz Score",
            sub_header: "Average student video quiz score",
            percentage: this.average_video_quiz_score.toFixed(1)
          })
        }
      }
    },
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
#table-container {
  max-height: 30rem;
  overflow-y: auto;
}
</style>