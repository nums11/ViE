<template>
  <div class="submission-table">
    <sui-table celled striped>
      <sui-table-header>
        <sui-table-row>
          <sui-table-header-cell colspan="2">
            {{ is_qr ? 'QR Scan' : 'Video' }} Submissions
          </sui-table-header-cell>
        </sui-table-row>
        <sui-table-row>
          <sui-table-header-cell>
            Present ({{ task.submissions.length }}/{{ student_ids.size }})
          </sui-table-header-cell>
          <sui-table-header-cell>
            Absent ({{ student_ids.size }}/{{ student_ids.size }})
          </sui-table-header-cell>
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
    },
    is_qr: {
      type: Boolean,
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
