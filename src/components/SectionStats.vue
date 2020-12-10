<template>
  <div class="section-stats">
    <h3 class="section-header">Section {{ section.section_number }}</h3>
    <div class="table">
      <sui-table celled padded>
        <sui-table-header>
          <sui-table-header-cell text-align="center">
            <sui-popup content="Sort by Name" position="top center" inverted>
              <span @click="sortTable('name')" class="header-cell" slot="trigger">
                Name
              </span>
            </sui-popup>
          </sui-table-header-cell>
          <sui-table-header-cell text-align="center" class="header-cell">
            <sui-popup content="Sort by ID" position="top center" inverted>
              <span @click="sortTable('id')" class="header-cell" slot="trigger">
                ID
              </span>
            </sui-popup>
          </sui-table-header-cell>
          <sui-table-header-cell text-align="center" class="header-cell">
            <sui-popup content="Sort by Overall Attendance %" position="top center" inverted>
              <span @click="sortTable('overall')" class="header-cell" slot="trigger">
                Overall Attendance %
              </span>
            </sui-popup>
          </sui-table-header-cell>
          <sui-table-header-cell text-align="center" class="header-cell">
            <sui-popup content="Sort by Live Attendance %" position="top center" inverted>
              <span @click="sortTable('live')" class="header-cell" slot="trigger">
                Live Attendance %
              </span>
            </sui-popup>
          </sui-table-header-cell>
          <sui-table-header-cell text-align="center" class="header-cell">
            <sui-popup content="Sort by Async Attendance %" position="top center" inverted>
              <span @click="sortTable('async')" class="header-cell" slot="trigger">
                Async Attendance %
              </span>
            </sui-popup>
          </sui-table-header-cell>
        </sui-table-header>
        <sui-table-body>
          <sui-table-row v-for="student in students_with_metrics">
            <sui-table-cell text-align="center">
              <h4>{{ student.name }}</h4>
            </sui-table-cell>
            <sui-table-cell >{{ student.id }}</sui-table-cell>
            <sui-table-cell text-align="center">{{ student.overall_percent }}%</sui-table-cell>
            <sui-table-cell text-align="center">{{ student.live_percent }}%</sui-table-cell>
            <sui-table-cell text-align="center">{{ student.async_percent }}%</sui-table-cell>
          </sui-table-row>
        </sui-table-body>
      </sui-table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SectionStats',
  props: {
    section: {
      type: Object,
      required: true
    },
  },
  components: {
  },
  data () {
    return {
      meeting_submission_ids: [],
      students_with_metrics: []
    }
  },
  created () {
    console.log("Section", this.section)
    this.num_meetings = this.section.meetings.length
    this.num_live_meetings = 0
    this.num_async_meetings = 0
    this.table_sorting_property = null
    this.sorting_orientation = "least_to_greatest"
    this.getSubmissionIDSForAllMeetings()
    this.calculateMetricsForEachStudent()
  },
  methods: {
    getSubmissionIDSForAllMeetings() {
      this.section.meetings.forEach(meeting => {
        if(meeting.has_live_attendance)
          this.num_live_meetings++
        if(meeting.has_async_attendance)
          this.num_async_meetings++
        let [live_submission_ids, async_submission_ids] = this.getMeetingSubmissionIDs(meeting)
        this.meeting_submission_ids.push({
          live_submission_ids: live_submission_ids,
          async_submission_ids: async_submission_ids
        })
      })
    },
    calculateMetricsForEachStudent() {
      this.section.students.forEach(student => {
        let num_live_attended = 0
        let num_async_attended = 0
        let total_num_attended = 0
        this.meeting_submission_ids.forEach(meeting => {
          let attended = false
          if(meeting.live_submission_ids.has(student.user_id)) {
            num_live_attended++
            attended = true
          }
          if(meeting.async_submission_ids.has(student.user_id)) {
            num_async_attended++
            attended = true
          }
          if(attended)
            total_num_attended++
        })
        let overall_percent = this.num_meetings === 0 ? 0:
          ((total_num_attended / this.num_meetings) * 100).toFixed(1)
        let live_percent = this.num_live_meetings === 0 ? 0:
          ((num_live_attended / this.num_live_meetings) * 100).toFixed(1)
        let async_percent = this.num_async_meetings === 0 ? 0:
          ((num_async_attended / this.num_async_meetings) * 100).toFixed(1)
        this.students_with_metrics.push({
          name: `${student.first_name} ${student.last_name}`,
          id: student.user_id,
          overall_percent: overall_percent,
          live_percent: live_percent,
          async_percent: async_percent
        })
      })
    },
    getMeetingSubmissionIDs(meeting) {
      let live_submission_ids = new Set()
      meeting.live_attendance.qr_checkins.forEach(qr_checkin =>{
        qr_checkin.qr_checkin_submissions.forEach(submission => {
          live_submission_ids.add(submission.submitter.user_id)
        })
      })
      let async_submission_ids = new Set()
      meeting.async_attendance.recordings.forEach(recording =>{
        recording.recording_submissions.forEach(submission => {
          async_submission_ids.add(submission.submitter.user_id)
        })
      })
      return [live_submission_ids, async_submission_ids]
    },
    sortTable(property) {
      if(this.table_sorting_property === property)
        this.invertSortingOrientation()
      this.table_sorting_property = property
      if(this.table_sorting_property !== "name" &&
        this.table_sorting_property !== "id"){
        this.students_with_metrics.sort(this.compareNumbers)
      } else {
        this.students_with_metrics.sort(this.compareStrings)
      }
      this.invert_sort = false
    },
    compareStrings(a,b) {
      let [a_value, b_value] = this.getValuesBasedOnTableSortingProperty(a,b)
      if ( a_value < b_value ){
        return this.sorting_orientation === "greatest_to_least" ? 1 : -1;
      }
      if ( a_value > b_value ){
        return this.sorting_orientation === "greatest_to_least" ? -1 : 1;
      }
      return 0;
    },
    compareNumbers(a,b) {
      let [a_value, b_value] = this.getValuesBasedOnTableSortingProperty(a,b)
      return this.sorting_orientation === "greatest_to_least" ?
              b_value - a_value : a_value - b_value;
    },
    getValuesBasedOnTableSortingProperty(a,b) {
      let a_value = null, b_value = null
      if(this.table_sorting_property === "name"){
        a_value = a.name
        b_value = b.name
      }else if(this.table_sorting_property === "id"){
        a_value = a.id
        b_value = b.id
      }else if(this.table_sorting_property === "overall"){
        a_value = a.overall_percent
        b_value = b.overall_percent
      }else if(this.table_sorting_property === "live"){
        a_value = a.live_percent
        b_value = b.live_percent
      }else if(this.table_sorting_property === "async"){
        a_value = a.async_percent
        b_value = b.async_percent
      }
      return [a_value, b_value]
    },
    invertSortingOrientation() {
      if(this.sorting_orientation === "least_to_greatest")
        this.sorting_orientation = "greatest_to_least"
      else
        this.sorting_orientation = "least_to_greatest"
    }
  }
}
</script>

<style lang="css" scoped>
.section-header {
  margin-top: 2rem;
}

.table {
  padding: 3px;
  height: 30rem;
  overflow-y: scroll;
}

.header-cell {
  font-weight: bold;
  cursor: pointer;
}
</style>