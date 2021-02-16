<template>
  <div class="submission-table">
    <sui-table celled>
      <sui-table-header>
        <sui-table-row>
          <sui-table-header-cell colspan="2">
            QR Scan Submissions
            <sui-button @click="$emit('hide-submission-table')"
            content="Back" icon="arrow left"
            label-position="left" size="small"
            class="float-right" />
          </sui-table-header-cell>
        </sui-table-row>
        <sui-table-row>
          <sui-table-header-cell style="vertical-align:top;">
            Present ({{ present_students.length }}/{{ meeting_students.size }})
          </sui-table-header-cell>
          <sui-table-header-cell>
            Absent ({{ absent_students.length }}/{{ meeting_students.size }})
            <br/>
            <div id="manual-override-text">
              Click on students then select the 'Save Changes' button at the
              bottom to manually mark them as present.
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
            <div v-if="i-1 < absent_students.length">
              <div>
                <sui-popup content="Mark Present" position="top center"
                inverted>
                  <sui-button @click="markPresent(i-1)"
                  size="small"slot="trigger"
                  style="background-color:#e83e8c; color:white; width: 50%;"
                  :id="`absent-student-${i-1}`">
                      {{ absent_students[i-1].first_name }}
                      {{ absent_students[i-1].last_name }}
                      ({{ absent_students[i-1].user_id }})
                  </sui-button>
                </sui-popup>
              </div>
            </div>
          </sui-table-cell>
        </sui-table-row>
      </sui-table-body>
      <sui-table-footer>
        <sui-table-row>
          <sui-table-header-cell colspan="2">
            <div v-if="selected_btn_indexes.length > 0"
              class="float-right bold" >
              <span class="mr-2">
                Mark ({{ selected_btn_indexes.length }}) students present
              </span>
              <sui-button @click="overrideStudents"
              content="Save Changes" size="small" 
              style="background-color:#00b80c; color:white;" />
            </div>
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
  name: 'QRSubmissionTable',
  mixins: [helpers],
  props:{
    task: {
      type: Object,
      required: true
    },
    meeting_students: {
      type: Set,
      required: true
    }
  },
  data: function () {
    return {
      present_students: [],
      absent_students: [],
      num_table_rows: 0,
      selected_btn_indexes: []
    }
  },
  created () {
    const students = this.getPresentAndAbsentStudents(
      this.meeting_students, this.task)
    this.present_students = students.present_students
    this.absent_students = students.absent_students
    this.num_table_rows = students.num_table_rows
  },
  methods: {
    markPresent(index) {
      const button =
        document.getElementById(`absent-student-${index}`)
      if(this.selected_btn_indexes.includes(index)) {
        let slice_index;
        for(let i = 0; i < this.selected_btn_indexes.length;
          i++) {
          if(this.selected_btn_indexes[i] === index) {
            slice_index = i
            break
          }
        }
        this.selected_btn_indexes.splice(slice_index, 1)
        button.style.backgroundColor = "#e83e8c"
      } else {
        this.selected_btn_indexes.push(index)
        button.style.backgroundColor = "#ad316a"
      }
    },
    async overrideStudents() {
      let submissions = []
      this.selected_btn_indexes.forEach(index => {
        submissions.push({
          submitter: this.absent_students[index]._id,
          task_type:"QRScan"
        })
      })

      try {
        const response = await SubmissionAPI.addQRSubmissions(
          submissions, this.task._id)
        const updated_qr_scans = response.data
        this.task.submissions =
          updated_qr_scans[updated_qr_scans.length-1].submissions
        this.removeSelectedBackgroundColors()
        this.absent_students = []
        this.present_students = []
        const students = this.getPresentAndAbsentStudents(
          this.meeting_students, this.task)
        this.present_students = students.present_students
        this.absent_students = students.absent_students
        this.num_table_rows = students.num_table_rows
        this.selected_btn_indexes = []
      } catch(error) {
        console.log(error)
        window.alert("Sorry, something went wrong")
      }
    },
    removeSelectedBackgroundColors() {
      for(let i = 0; i < this.absent_students.length;
        i++) {
        const button =
          document.getElementById(`absent-student-${i}`)
        button.style.backgroundColor = "#e83e8c"
      }
    }
  }
}
</script>

<style scoped>
.submission-table {
  margin-top: 4rem;
}

#manual-override-text {
  font-weight: normal;
  margin-top: 0.25rem;
}
</style>
