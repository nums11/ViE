<template>
  <sui-table celled>
    <sui-table-header>
      <sui-table-row>
        <sui-table-header-cell :colspan="meetings.length+1">
          Overall Meeting Attendance
          <sui-button @click="exportTable"
          size="small" animated
          style="background-color:#00B3FF; color:white;
          margin-left: 2rem;">
              <sui-button-content visible>Export As CSV</sui-button-content>
              <sui-button-content hidden>
                  <sui-icon name="download" />
              </sui-button-content>
          </sui-button>
        </sui-table-header-cell>
      </sui-table-row>
      <sui-table-row class="center-text">
        <sui-table-header-cell colspan="1">
          Students
        </sui-table-header-cell>
        <sui-table-header-cell :colspan="meetings.length">
          Meetings
          <br/>
          <div class="header-sub-text">
            Yes if they submitted to at least 1 task,
            No if they did not.
          </div>
        </sui-table-header-cell>
      </sui-table-row>
      <sui-table-row>
        <sui-table-header-cell>
        </sui-table-header-cell>
        <sui-table-header-cell v-for="meeting in meetings">
          {{ meeting.title }}
        </sui-table-header-cell>
      </sui-table-row>
    </sui-table-header>
    <sui-table-body class="center-text">
      <sui-table-row v-for="student_attendance in
      student_attendance_by_meeting">
        <sui-table-cell v-for="(value,index) in student_attendance"
        :class="index === 0 ? 'bold grey-background' : ''">
          {{ value }}
        </sui-table-cell>
      </sui-table-row>
    </sui-table-body>
  </sui-table>
</template>

<script>
import helpers from '@/helpers.js'

export default {
  name: 'MeetingSubmissionTable',
  mixins: [helpers],
  props:{
    meetings: {
      type: Array,
      required: true
    },
    course: {
      type: Object,
      required: true
    }
  },
  data: function () {
    return {
      students: [],
      student_attendance_by_meeting: []
    }
  },
  created () {
    this.getStudentsFromCourse()
    this.getStudentAttendanceByMeeting()
  },
  methods: {
    getStudentsFromCourse() {
      this.course.sections.forEach(section => {
        this.students = this.students.concat(
          section.students)
      })
    },
    getStudentAttendanceByMeeting() {
      const submitter_user_ids_for_each_meeting =
        this.getSubmitterUserIDsForEachMeeting()
      this.students.forEach(student => {
        let student_attendance = []
        student_attendance.push(
          `${student.first_name} ${student.last_name} `
          + `(${student.user_id})`)
        submitter_user_ids_for_each_meeting.forEach(
          submitter_user_ids => {
            if(submitter_user_ids.has(student.user_id))
              student_attendance.push("Yes")
            else
              student_attendance.push("No")
          }
        )
        this.student_attendance_by_meeting.push(
          student_attendance)
      })
    },
    getSubmitterUserIDsForEachMeeting() {
      const submitter_user_ids_for_each_meeting = []
      this.meetings.forEach(meeting => {
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
    exportTable() {
      const csv_content = "data:text/csv;charset=utf-8," 
          + this.student_attendance_by_meeting.map
          (e => e.join(",")).join("\n");
      const encoded_uri = encodeURI(csv_content);
      const link = document.createElement("a");
      link.setAttribute("href", encoded_uri);
      link.setAttribute("download",
        `${this.course.name} Attendance By Meeting.csv`);
      document.body.appendChild(link); // Required for FF
      link.click(); // This will download the data file named "my_data.csv".
    }
  }
}
</script>

<style scoped>
.header-sub-text {
  font-weight: normal;
  margin-top: 0.25rem;
}

.grey-background {
  background-color: #f9fafb;
}
</style>
