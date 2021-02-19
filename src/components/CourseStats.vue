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
        <CoursePercentiles :meetings="populated_meetings"
        :student_attendance_data="student_attendance_data" />
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
import CoursePercentiles from
'@/components/CoursePercentiles'
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
    CourseAverages,
    CoursePercentiles
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
    getStudentsFromCourse() {
      this.course.sections.forEach(section => {
        this.students = this.students.concat(
          section.students)
      })
    },
    getStudentAttendanceData() {
      const student_attendance_data = []
      const submitter_user_ids_for_each_meeting =
        this.getSubmitterUserIDsForEachMeeting()
      this.students.forEach(student => {
        const student_name = `${student.first_name} `
        + `${student.last_name} (${student.user_id})`
        const attendance_by_meeting = []
        let num_meetings_attended = 0
        submitter_user_ids_for_each_meeting.forEach(
          submitter_user_ids => {
            if(submitter_user_ids.has(student.user_id)) {
              attendance_by_meeting.push("Yes")
              num_meetings_attended++
            } else {
              attendance_by_meeting.push("No")
            }
          }
        )
        const overall_attendance_percentage =
          (num_meetings_attended /
            this.populated_meetings.length) * 100
        this.student_attendance_data.push({
          student_name: student_name,
          overall_attendance_percentage:
          overall_attendance_percentage,
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
        submitter_user_ids_for_each_meeting.push(
          submitter_user_ids)
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