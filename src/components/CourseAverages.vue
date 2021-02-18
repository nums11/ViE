<template>
  <div>
    <div v-if="meetings.length === 0"
    class="center-text" id="no-averages">
      Schedule a meeting to see course averages.
    </div>
    <div v-else>
      <Metric v-for="(metric,index) in metrics"
      :class="`mt-1 ${index % 3 !== 0 ? 'ml-2' : ''}`"
      :header="metric.header"
      :sub_header="metric.sub_header"
      :percentage="metric.percentage"
      size="medium" />
    </div>
  </div>
</template>

<script>
import Metric from '@/components/Metric'
import helpers from '@/helpers.js'

export default {
  name: 'CourseStats',
  mixins: [helpers],
  props: {
    meetings: {
      type: Array,
      required: true
    }
  },
  components: {
    Metric
  },
  data () {
    return {
      average_overall_percent: 0,
      average_real_time_percent: 0,
      average_async_percent: 0,
      average_qr_scan_submission_percent: 0,
      average_video_submission_perent: 0,
      average_quiz_score: 0,
      average_video_viewing_percent: 0,
      average_video_quiz_score: 0,
      course_has_meetings_with_qr_scans: false,
      course_has_meetings_with_quizzes: false,
      course_has_meetings_with_videos: false,
      course_has_meetings_with_video_quizzes: false,
      course_has_meetings_with_real_time_tasks: false,
      course_has_meetings_with_async_tasks: false,
      course_has_meetings_with_tasks: false,
      metrics: []
    }
  },
  created () {
    this.calculateCourseAverages()
    this.setMetrics()
  },
  methods: {
    calculateCourseAverages() {
      const num_meetings = this.meetings.length
      if(num_meetings === 0)
        return

      let total_overall_percent = 0, total_real_time_percent = 0,
      total_async_percent = 0,
      total_qr_submission_percent = 0, num_meetings_with_qr = 0,
      total_video_submission_percent = 0, num_meetings_with_video = 0,
      total_video_viewing_percent = 0, total_video_quiz_score = 0,
      num_meetings_with_video_quiz = 0,
      total_quiz_score = 0, num_meetings_with_quiz = 0
      this.meetings.forEach(meeting => {
        const meeting_students = this.getMeetingStudents(
          meeting)
        const percentages = this.calculateMeetingPercentages(
          meeting, meeting_students)
        total_overall_percent += percentages.overall_percent
        total_real_time_percent += percentages.real_time_percent
        total_async_percent += percentages.async_percent
        if(this.meetingHasTaskType(meeting, 'qr_scan')) {
          total_qr_submission_percent +=
            percentages.average_qr_scan_submission_percent
          num_meetings_with_qr++
        }
        if(this.meetingHasTaskType(meeting, 'video')) {
          total_video_submission_percent +=
            percentages.average_video_submission_perent
          total_video_viewing_percent +=
            percentages.average_video_viewing_percent
          num_meetings_with_video++
          if(this.meetingHasTaskType(meeting, 'video_quiz')) {
            total_video_quiz_score +=
              percentages.average_video_quiz_score
            num_meetings_with_video_quiz++
          }
        }
        if(this.meetingHasTaskType(meeting, 'quiz')) {
          total_quiz_score +=
            percentages.average_quiz_score
          num_meetings_with_quiz++
        }
      })
      this.average_overall_percent =
        (total_overall_percent / num_meetings)
      this.average_real_time_percent =
        (total_real_time_percent / num_meetings)
      this.average_async_percent =
        (total_async_percent / num_meetings)
      if(num_meetings_with_qr > 0) {
        this.course_has_meetings_with_qr_scans = true
        this.average_qr_scan_submission_percent =
          (total_qr_submission_percent / num_meetings_with_qr) * 100
      }
      if(num_meetings_with_quiz > 0) {
        this.course_has_meetings_with_quizzes = true
        this.average_quiz_score =
          (total_quiz_score / num_meetings_with_quiz)
      }
      if(num_meetings_with_video > 0) {
        this.course_has_meetings_with_videos = true
        this.average_video_submission_perent =
          (total_video_submission_percent / num_meetings_with_video) * 100
        this.average_video_viewing_percent =
          (total_video_viewing_percent / num_meetings_with_video)
        if(num_meetings_with_video_quiz > 0) {
          this.course_has_meetings_with_video_quizzes = true
          this.average_video_quiz_score =
            (total_video_quiz_score / num_meetings_with_video_quiz)
        }
      }
      this.course_has_meetings_with_real_time_tasks =
        this.course_has_meetings_with_qr_scans ||
          this.course_has_meetings_with_quizzes
      this.course_has_meetings_with_async_tasks =
        this.course_has_meetings_with_videos
      this.course_has_meetings_with_tasks =
        this.course_has_meetings_with_real_time_tasks ||
          this.course_has_meetings_with_async_tasks
    },
    setMetrics() {
      if(this.course_has_meetings_with_tasks) {
        this.metrics.push({
          header: "Average Overall Attendance Percentage",
          sub_header: "Average percentage of students who submit to "
            + "at least 1 task in a meeting.",
          percentage: this.average_overall_percent.toFixed(1)
        })
      }
      if(this.course_has_meetings_with_real_time_tasks) {
        this.metrics.push({
          header: "Average Real-Time Attendance Percentage",
          sub_header: "Average percentage of students who submit to at "
            + "least 1 real-time task in a meeting.",
          percentage: this.average_real_time_percent.toFixed(1)
        })
      }
      if(this.course_has_meetings_with_async_tasks) {
        this.metrics.push({
          header: "Average Async Attendance Percentage",
          sub_header: "Average percentage of students who submit to at "
            + "least 1 asyc task in a meeting.",
          percentage: this.average_async_percent.toFixed(1)
        })
      }
      if(this.course_has_meetings_with_qr_scans) {
        this.metrics.push({
          header: "Average QR Scan Submission Percentage",
          sub_header: "Average percentage of students who scan a qr.",
          percentage: this.average_qr_scan_submission_percent.toFixed(1)
        })
      }
      if(this.course_has_meetings_with_quizzes) {
        this.metrics.push({
          header: "Average Real-Time Quiz Score",
          sub_header: "Average student real-time quiz score.",
          percentage: this.average_quiz_score.toFixed(1)
        })
      }
      if(this.course_has_meetings_with_videos) {
        this.metrics.push({
          header: "Average Video Submission Percentage",
          sub_header: "Average percentage of students who watch a video.",
          percentage: this.average_video_submission_perent.toFixed(1)
        })
        this.metrics.push({
          header: "Average Video Viewing Percentage",
          sub_header: "Average percent of videos that students view.",
          percentage: this.average_video_viewing_percent.toFixed(1)
        })
        if(this.course_has_meetings_with_video_quizzes) {
          this.metrics.push({
            header: "Average Video Quiz Score",
            sub_header: "Average student video quiz score",
            percentage: this.average_video_quiz_score.toFixed(1)
          })
        }
      }
    }
  }
}
</script>

<style scoped>
#no-averages {
  margin-top: 6rem;
  font-size: 1.25rem;
}
</style>