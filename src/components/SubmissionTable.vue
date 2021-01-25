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
            Present ({{ present_students.length }}/{{ meeting_students.size }})
          </sui-table-header-cell>
          <sui-table-header-cell>
            Absent ({{ absent_students.length }}/{{ meeting_students.size }})
          </sui-table-header-cell>
        </sui-table-row>
      </sui-table-header>
      <sui-table-body>
        <sui-table-row v-for="i in num_table_rows" :key="i">
          <sui-table-cell :width="3">
            <span v-if="i-1 < present_students.length" class="bold">
              {{ present_students[i-1].first_name }}
              {{ present_students[i-1].last_name }}
              ({{ present_students[i-1].user_id }})
            </span>
          </sui-table-cell>
          <sui-table-cell :width="3">
            <span v-if="i-1 < absent_students.length" class="bold">
              {{ absent_students[i-1].first_name }}
              {{ absent_students[i-1].last_name }}
              ({{ absent_students[i-1].user_id }})
            </span>
          </sui-table-cell>
        </sui-table-row>
      </sui-table-body>
      <sui-table-footer>
        <sui-table-row>
          <sui-table-header-cell colspan="2">
            <sui-button @click="$emit('hide-submission-table')"
            content="Back" icon="arrow left"
            label-position="left" size="small"
            class="float-right" />
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
    meeting_students: {
      type: Set,
      required: true
    },
    is_qr: {
      type: Boolean,
      required: true
    },
  },
  data: function () {
    return {
      present_students: [],
      absent_students: [],
      num_table_rows: 0
    }
  },
  created () {
    this.getPresentAndAbsentStudents()
  },
  methods: {
    getPresentAndAbsentStudents() {
      let submitter_ids = new Set()
      this.task.submissions.forEach(submission => {
        submitter_ids.add(submission.submitter.user_id)
      })
      this.meeting_students.forEach(student => {
        if(submitter_ids.has(student.user_id))
          this.present_students.push(student)
        else
          this.absent_students.push(student)
      })
      if(this.present_students.length > this.absent_students.length)
        this.num_table_rows = this.present_students.length
      else
        this.num_table_rows = this.absent_students.length
    }
  }
}
</script>

<style scoped>
.submission-table {
  margin-top: 4rem;
}
</style>
