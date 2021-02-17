<template>
  <div>
    <sui-table celled>
      <sui-table-header>
        <sui-table-row>
          <sui-table-header-cell colspan="2">
            Overall Attendance
          </sui-table-header-cell>
        </sui-table-row>
        <sui-table-row>
          <sui-table-header-cell style="vertical-align:top;">
            Present ({{ present_students.length }}/{{ meeting_students.size }})
            <br/>
            <div class="header-sub-text">
              Students who submitted to at least 1 task appear here
            </div>
          </sui-table-header-cell>
          <sui-table-header-cell>
            Absent ({{ absent_students.length }}/{{ meeting_students.size }})
            <br/>
            <div class="header-sub-text">
              Students who did not submit to any task appear here
            </div>
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
    </sui-table>
  </div>
</template>

<script>
import helpers from '@/helpers.js'

export default {
  name: 'MeetingSubmissionTable',
  mixins: [helpers],
  props:{
    meeting: {
      type: Object,
      required: true
    },
    meeting_students: {
      type: Set,
      required: true
    },
    present_students: {
      type: Array,
      required: true
    },
    absent_students: {
      type: Array,
      required: true
    }
  },
  data: function () {
    return {
      num_table_rows: 0
    }
  },
  created () {
    if(this.present_students.length > this.absent_students.length)
      this.num_table_rows = this.present_students.length
    else
      this.num_table_rows = this.absent_students.length
  },
  methods: {

  }
}
</script>

<style scoped>
.header-sub-text {
  font-weight: normal;
  margin-top: 0.25rem;
}
</style>
