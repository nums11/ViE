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
      <sui-table-row v-for="data in student_attendance_data">
        <sui-table-cell class="bold grey-background">
          {{ data.student_name }}
        </sui-table-cell>
        <sui-table-cell v-for="value in data.attendance_by_meeting">
          {{ value }}
        </sui-table-cell>
      </sui-table-row>
    </sui-table-body>
  </sui-table>
</template>

<script>
import helpers from '@/helpers.js'

export default {
  name: 'CourseAttendanceTable',
  mixins: [helpers],
  props:{
    meetings: {
      type: Array,
      required: true
    },
    course_name: {
      type: String,
      required: true
    },
    student_attendance_data: {
      type: Array,
      required: true
    }
  },
  data: function () {
    return {
      all_student_attendance_by_meeting: []
    }
  },
  created () {
    this.getAllStudentAttendanceByMeeting()
  },
  methods: {
    getAllStudentAttendanceByMeeting() {
      this.student_attendance_data.forEach(data => {
        this.all_student_attendance_by_meeting.push(
          data.attendance_by_meeting)
      })
    },
    exportTable() {
      const csv_content = "data:text/csv;charset=utf-8," 
          + this.all_student_attendance_by_meeting.map
          (e => e.join(",")).join("\n");
      const encoded_uri = encodeURI(csv_content);
      const link = document.createElement("a");
      link.setAttribute("href", encoded_uri);
      link.setAttribute("download",
        `${this.course_name} Attendance By Meeting.csv`);
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
