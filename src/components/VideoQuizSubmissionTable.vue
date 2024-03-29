<template>
  <div class="submission-table">
    <sui-table celled>
      <sui-table-header>
        <sui-table-row>
          <sui-table-header-cell colspan="5">
            {{ table_header }}
            <sui-button @click="$emit('hide-submission-table')"
            content="Back" icon="arrow left"
            label-position="left" size="small"
            class="float-right" />
          </sui-table-header-cell>
        </sui-table-row>
        <sui-table-row>
          <sui-table-header-cell :colspan="present_colspan"
          style="vertical-align:top;">
            Present ({{ present_students.length }}/{{ meeting_students.size }})
          </sui-table-header-cell>
          <sui-table-header-cell colspan="2">
            Absent ({{ absent_students.length }}/{{ meeting_students.size }})
            <br/>
          </sui-table-header-cell>
        </sui-table-row>
        <sui-table-row>
          <sui-table-header-cell colspan="1">Name</sui-table-header-cell>
          <sui-table-header-cell v-if="is_video" colspan="1">
            Video % Watched
          </sui-table-header-cell>
          <sui-table-header-cell colspan="1">Quiz %</sui-table-header-cell>
          <sui-table-header-cell colspan="2">Name</sui-table-header-cell>
        </sui-table-row>
      </sui-table-header>
      <sui-table-body>
        <sui-table-row v-for="i in num_table_rows" :key="i">
          <sui-table-cell >
            <span v-if="i-1 < present_students.length" class="bold">
              {{ present_students[i-1].first_name }}
              {{ present_students[i-1].last_name }}
              ({{ present_students[i-1].user_id }})
            </span>
          </sui-table-cell>
          <sui-table-cell v-if="is_video">
            <span v-if="i-1 < present_students.length" class="bold">
              {{ (present_students[i-1].video_percent_watched).toFixed(1) }}
            </span>
          </sui-table-cell>
          <sui-table-cell >
            <span v-if="i-1 < present_students.length" class="bold">
              <span v-if="quiz == null">N/A</span>
              <span v-else>
                {{((present_students[i-1].num_correct_answers/
                  quiz.questions.length) * 100).toFixed(1) }}
                ({{ 
                  present_students[i-1].num_correct_answers }}/{{
                    quiz.questions.length }})
              </span>
            </span>
          </sui-table-cell>
          <sui-table-cell>
            <div v-if="i-1 < absent_students.length">
              <span class="bold">
                {{ absent_students[i-1].first_name }}
                {{ absent_students[i-1].last_name }}
                ({{ absent_students[i-1].user_id }})
              </span>
            </div>
          </sui-table-cell>
        </sui-table-row>
      </sui-table-body>
      <sui-table-footer>
        <sui-table-row>
          <sui-table-header-cell colspan="5">
            <sui-button @click="$emit('hide-submission-table')"
            content="Back" icon="arrow left"
            label-position="left" size="small"/>
          </sui-table-header-cell>
        </sui-table-row>
      </sui-table-footer>
    </sui-table>
  </div>
</template>

<script>
import SubmissionAPI from '@/services/SubmissionAPI'
import helpers from '@/helpers.js'

export default {
  name: 'VideoQuizSubmissionTable',
  mixins: [helpers],
  props:{
    task: {
      type: Object,
      required: true
    },
    meeting_students: {
      type: Set,
      required: true
    },
    is_video: {
      type: Boolean,
      required: true
    }
  },
  data: function () {
    return {
      present_students: [],
      absent_students: [],
      num_table_rows: 0,
      table_header: "",
      present_colspan: 0,
      quiz: null
    }
  },
  created () {
    this.setVariables()
    const students = this.getPresentAndAbsentStudents(
      this.meeting_students, this.task)
    this.present_students = students.present_students
    this.absent_students = students.absent_students
    this.num_table_rows = students.num_table_rows
  },
  methods: {
    setVariables() {
      let task_type;
      if(this.is_video) {
        task_type = 'Video'
        this.present_colspan = 3
        this.quiz = this.task.quiz
      } else {
        task_type = 'Quiz'
        this.present_colspan = 2
        this.quiz = this.task
      }
      this.table_header = `${task_type} Submissions`
    }
  }
}
</script>

<style scoped>
.submission-table {
  margin-top: 4rem;
}
</style>
