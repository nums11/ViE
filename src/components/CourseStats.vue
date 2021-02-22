<template>
  <div class="course-stats">
    <sui-loader v-if="!data_loaded"
    active size="medium">
      Calculating Statistics...
    </sui-loader>
    <sui-tab v-else>
      <sui-tab-pane class="stats-pane" title="Course Averages">
        <CourseAverages :meetings="populated_meetings" />
      </sui-tab-pane>
      <sui-tab-pane class="stats-pane" title="Attendance By Meeting">
        <CourseAttendanceTable :meetings="populated_meetings"
        :course_name="course.name"
        :student_attendance_data="student_attendance_data" />
      </sui-tab-pane>
      <sui-tab-pane class="stats-pane" title="Percentiles">
        <CoursePercentiles
        :student_attendance_data="student_attendance_data" />
      </sui-tab-pane>
      <sui-tab-pane class="stats-pane" title="Engagement Warnings">
        <CourseEngagementWarnings
        :student_attendance_data="student_attendance_data" />
      </sui-tab-pane>
      <sui-tab-pane class="stats-pane" title="Student Insights">
        <StudentInsights
        :student_attendance_data="student_attendance_data"
        :meetings="populated_meetings" />
      </sui-tab-pane>
    </sui-tab>
  </div>
</template>

<script>
import CourseAverages from '@/components/CourseAverages'
import CourseAttendanceTable from
'@/components/CourseAttendanceTable'
import CoursePercentiles from
'@/components/CoursePercentiles'
import CourseEngagementWarnings from
'@/components/CourseEngagementWarnings'
import StudentInsights from
'@/components/StudentInsights'
import MeetingAPI from '@/services/MeetingAPI'
import helpers from '@/helpers'
import moment from 'moment'

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
    CourseAverages,
    CoursePercentiles,
    CourseEngagementWarnings,
    StudentInsights
  },
  data () {
    return {
      students: [],
      student_attendance_data: [],
      populated_meetings: [],
      data_loaded: false
    }
  },
  async created() {
    try {
      await this.getPopulatedMeetings()
      this.removeUpcomingMeetings()
      this.getStudentsFromCourse()
      this.getStudentAttendanceData()
      this.data_loaded = true
    } catch(error) {
      console.log(error)
      alert("Sorry, something went wrong")
    }
  },
  methods: {
    async getPopulatedMeetings() {
      try {
        const meeting_ids = this.getObjectIdsFromObjects(
          this.meetings)
        const response = await MeetingAPI.getPopulatedMeetings(
          meeting_ids)
        this.populated_meetings = response.data
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong")
      }
    },
    removeUpcomingMeetings() {
      const meetings = []
      const now = Date.now()
      this.populated_meetings.forEach(meeting => {
        if((meeting.real_time_portion != null
          && moment(meeting.real_time_portion.real_time_start).
              isBefore(now)) ||
          (meeting.async_portion != null &&
            moment(meeting.async_portion.async_start).
              isBefore(now))) {
          meetings.push(meeting)
        }
      })
      this.populated_meetings = meetings
    },
    getStudentsFromCourse() {
      this.course.sections.forEach(section => {
        this.students = this.students.concat(
          section.students)
      })
    },
    getStudentAttendanceData() {
      const student_attendance_data = []
      const meetings =
        this.getSubmitterUserIDsForEachMeeting()
      this.students.forEach(student => {
        const student_name = `${student.first_name} `
        + `${student.last_name}`
        const attendance_by_meeting = []
        let num_meetings_attended = 0,
        num_real_time_meetings_attended = 0,
        num_async_meetings_attended = 0,
        total_num_real_time_meetings = 0,
        total_num_async_meetings = 0
        meetings.forEach(meeting => {
          if(meeting.submitter_user_ids.has(student.user_id)) {
            attendance_by_meeting.push("Yes")
            num_meetings_attended++
          } else {
            attendance_by_meeting.push("No")
          }
          if(meeting.has_real_time_tasks) {
            total_num_real_time_meetings++
            if(meeting.real_time_submitter_user_ids.has(
              student.user_id)) {
              num_real_time_meetings_attended++
            }
          }
          if(meeting.has_async_tasks) {
            total_num_async_meetings++
            if(meeting.async_submitter_user_ids.has(
              student.user_id)) {
              num_async_meetings_attended++
            }
          }
        })
        let overall_attendance_percentage = 0,
        real_time_attendance_percentage = 0,
        async_attendance_percentage = 0
        if(this.populated_meetings.length > 0) {
          overall_attendance_percentage = (num_meetings_attended /
            this.populated_meetings.length) * 100
          if(total_num_real_time_meetings > 0) {
            real_time_attendance_percentage =
              (num_real_time_meetings_attended /
                total_num_real_time_meetings) * 100
          }
          if(total_num_async_meetings > 0) {
            async_attendance_percentage =
              (num_async_meetings_attended /
                total_num_async_meetings) * 100
          }
        }
        this.student_attendance_data.push({
          student_name: student_name,
          user_id: student.user_id,
          overall_attendance_percentage:
          overall_attendance_percentage,
          real_time_attendance_percentage:
          real_time_attendance_percentage,
          async_attendance_percentage:
          async_attendance_percentage,
          attendance_by_meeting: attendance_by_meeting
        })
      })
    },
    getSubmitterUserIDsForEachMeeting() {
      const submitter_user_ids_for_each_meeting = []
      this.populated_meetings.forEach(meeting => {
        const meeting_students = this.getMeetingStudents(
          meeting)
        const meeting_percentages =
          this.calculateMeetingPercentages(meeting,
            meeting_students)
        const submitter_user_ids =
          meeting_percentages.submitter_user_ids
        const real_time_submitter_user_ids =
          meeting_percentages.real_time_submitter_user_ids
        const async_submitter_user_ids =
          meeting_percentages.async_submitter_user_ids
        const has_real_time_tasks = this.meetingHasTaskType(
        meeting, 'qr_scan') || this.meetingHasTaskType(
        meeting, 'quiz')
        const has_async_tasks = this.meetingHasTaskType(
        meeting, 'video')
        submitter_user_ids_for_each_meeting.push({
          submitter_user_ids: submitter_user_ids,
          real_time_submitter_user_ids: real_time_submitter_user_ids,
          async_submitter_user_ids: async_submitter_user_ids,
          has_real_time_tasks: has_real_time_tasks,
          has_async_tasks: has_async_tasks
        })
      })
      return submitter_user_ids_for_each_meeting
    },
  }
}
</script>

<style scoped>
.stats-pane {
  height: 40rem;
  overflow-y: auto;
}
</style>