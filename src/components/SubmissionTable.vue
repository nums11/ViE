<template>
  <div class="submission-table">
    <sui-table celled striped>
      <sui-table-header>
        <sui-table-row>
          <sui-table-header-cell colspan="2">
            QR Scan 1 Submissions
          </sui-table-header-cell>
        </sui-table-row>
        <sui-table-row>
          <sui-table-header-cell>Present (8/20)</sui-table-header-cell>
          <sui-table-header-cell>Absent (4/20)</sui-table-header-cell>
        </sui-table-row>
      </sui-table-header>
      <sui-table-body>
        <sui-table-row v-for="student_id in student_ids"
        :key="student_id">
          <sui-table-cell>{{ student_id }}</sui-table-cell>
        </sui-table-row>
      </sui-table-body>
      <sui-table-footer>
        <sui-table-row>
          <sui-table-header-cell colspan="2">
            <sui-button @click="$emit('hide-submission-table')"
            content="Back" icon="arrow left"
            label-position="left" size="small" />
          </sui-table-header-cell>
        </sui-table-row>
      </sui-table-footer>
    </sui-table>
  </div>
</template>

<script>
export default {
  name: 'SubmissionTable',
  props:{
    task: {
      type: Object,
      required: true
    },
    student_ids: {
      type: Set,
      required: true
    }
  },
  data: function () {
    return {

    }
  },
  created () {
  },
  methods: {
  }
}
</script>

<style scoped>
.submission-table {
  margin-top: 4rem;
}
</style>
