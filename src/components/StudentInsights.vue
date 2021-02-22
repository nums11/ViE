<template>
  <div>
    <div v-if="student_data == null">
      <h3>
        Click on a row to view the statistics for
        a student
      </h3>
      <StudentInsightsTable
      :students="student_attendance_data"
      v-on:select-row="showStudentStats" />
    </div>
    <StudentStats v-else
    :student_data="student_data"
    :meetings="meetings"
    v-on:hide-stats="hideStudentStats" />
  </div>
</template>

<script>
import StudentInsightsTable from
'@/components/StudentInsightsTable'
import StudentStats from '@/components/StudentStats'

export default {
  name: 'StudentInsights',
  props: {
    student_attendance_data: {
      type: Array,
      required: true
    },
    meetings: {
      type: Array,
      required: true
    }
  },
  components: {
    StudentInsightsTable,
    StudentStats
  },
  data() {
    return {
      student_data: null
    }
  },
  async created() {

  },
  methods: {
    showStudentStats(index) {
      this.student_data = this.student_attendance_data[index]
    },
    hideStudentStats() {
      this.student_data = null
    }
  }
}
</script>

<style scoped>

</style>