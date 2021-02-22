<template>
  <div>
    <div class="warning-msg bold">
      Engagement Warning: These students may be at risk
      due to low levels of engagement.
    </div>
    <sui-table celled striped>
      <sui-table-header>
        <sui-table-row>
          <sui-table-header-cell>
            Name
          </sui-table-header-cell>
          <sui-table-header-cell>
            User Id
          </sui-table-header-cell>
          <sui-table-header-cell>
            Overall Attendance %
          </sui-table-header-cell>
          <sui-table-header-cell>
            Real-Time Attendance %
          </sui-table-header-cell>
          <sui-table-header-cell>
            Async Attendance %
          </sui-table-header-cell>
        </sui-table-row>
      </sui-table-header>
      <sui-table-body>
        <sui-table-row v-for="student in bottom_10_percent_of_students">
          <sui-table-cell>{{ student.name }}</sui-table-cell>
          <sui-table-cell>{{ student.user_id }}</sui-table-cell>
          <sui-table-cell>
            {{ student.overall_attendance_percentage.toFixed(1) }}%
          </sui-table-cell>
          <sui-table-cell>
            {{ student.real_time_attendance_percentage.toFixed(1) }}%
          </sui-table-cell>
          <sui-table-cell>
            {{ student.async_attendance_percentage.toFixed(1) }}%
          </sui-table-cell>
        </sui-table-row>
      </sui-table-body>
    </sui-table>
  </div>
</template>

<script>
import helpers from '@/helpers.js'

export default {
  name: 'CourseEngagementWarnings',
  mixins: [helpers],
  props: {
    student_attendance_data: {
      type: Array,
      required: true
    }
  },
  components: {

  },
  data () {
    return {
      bottom_10_percent_of_students: []
    }
  },
  created() {
    this.getBottom10PercentOfStudents()
  },
  methods: {
    getBottom10PercentOfStudents() {
      const attendance_percentages =
        this.getAttendancePercentagesFromStudentData(
          this.student_attendance_data)
      this.overall_attendance_percentages =
        attendance_percentages.overall_attendance_percentages
      const percentile_values = this.getPercentileValues(
        this.student_attendance_data,
        this.overall_attendance_percentages, 10, false)
      const at_risk_students =
        this.getStudentsInPercentile(this.student_attendance_data,
          percentile_values, 1)
      const at_risk_student_user_ids = new Set()
      at_risk_students.forEach(student => {
        at_risk_student_user_ids.add(student.user_id)
      })
      this.student_attendance_data.forEach(data => {
        if(at_risk_student_user_ids.has(data.user_id)) {
          this.bottom_10_percent_of_students.push({
            name: data.student_name,
            user_id: data.user_id,
            overall_attendance_percentage:
            data.overall_attendance_percentage,
            real_time_attendance_percentage:
            data.real_time_attendance_percentage,
            async_attendance_percentage:
            data.async_attendance_percentage
          })
        }
      })
      this.bottom_10_percent_of_students.sort(
        (a,b) => {
          return a.overall_attendance_percentage -
          b.overall_attendance_percentage
        }
      )
    }
  }
}
</script>

<style scoped>
.warning-msg {
  font-size: 1.2rem;
  height: 2rem;
  padding: 0.25rem 0.5rem;
  border: black solid thin;
}
</style>