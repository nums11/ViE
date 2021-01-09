<template>
  <div class="meeting-info-portion-container">
    <div class="portion-header">{{ portion_label }}</div>
    <div>
      <div v-if="(is_real_time && real_time_portion != null)
      || (!is_real_time && async_portion != null)"
      class="inline-block">
        {{ start | moment("MMM Do, h:mm a") }}
        - {{ end | moment("MMM Do, h:mm a") }}
      </div>
      <div v-else>
        No {{ portion_type }} Portion
      </div>
      <sui-button animated size="small"
        style="background-color:#00b80c; color:white;
        float:right;">
        <sui-button-content visible>
          Add {{ portion_type }} Tasks
        </sui-button-content>
        <sui-button-content hidden>
          <sui-icon name="podcast" />
        </sui-button-content>
      </sui-button>
    </div>
    <div v-if="(is_real_time && real_time_portion != null)
      || (!is_real_time && async_portion != null)">
      <SubmissionTable v-if="show_submission_table"
      :task="table_task"
      :is_qr="is_real_time"
      :student_ids="meeting_student_ids"
      v-on:hide-submission-table="hideSubmissionTable" />
      <MeetingTasksContainer v-else
      :task_type="is_real_time ? 'qr_scan' : 'video'"
      :tasks="portion_tasks"
      v-on:show-qr="showQR"
      v-on:view-submissions="viewSubmissions" />
    </div>
    <div class="no-portion-text" v-else>
      No {{ portion_type }} Portion. Click the button in the
       top right to add real-time tasks.
    </div>
  </div>
</template>

<script>
import MeetingTasksContainer from 
'@/components/MeetingTasksContainer'
import SubmissionTable from
'@/components/SubmissionTable.vue';

export default {
  name: 'MeetingInfoPortionContainer',
  props: {
    real_time_portion: Object,
    async_portion: Object,
    meeting_student_ids: {
      type: Set,
      required: true
    }
  },
  components: {
    MeetingTasksContainer,
    SubmissionTable,
  },
  data () {
    return {
      show_submission_table: false,
      table_task: null,
      portion_label: "",
      portion_type: "",
      portion_tasks: []
    }
  },
  created () {
    console.log("real_time_portion", this.real_time_portion)
    console.log("async_portion", this.async_portion)
    this.is_real_time = this.real_time_portion != null
    this.setLabelsAndDates()
  },
  methods: {
    setLabelsAndDates() {
      if(this.is_real_time) {
        this.portion_type = "Real-Time"
        this.start = this.real_time_portion.real_time_start
        this.end = this.real_time_portion.real_time_end
        this.portion_tasks = this.real_time_portion.qr_scans
      } else {
        console.log("portion", this.async_portion)
        this.portion_type = "Async"
        this.start = this.async_portion.async_start
        this.end = this.async_portion.async_end
        this.portion_tasks = this.async_portion.videos
      }
      this.portion_label = `${this.portion_type} Portion`
    },
    viewSubmissions(task) {
      this.show_submission_table = true
      this.table_task = task
    },
    hideSubmissionTable() {
      this.show_submission_table = false
      this.table_task = null
    },
    showQR(qr_scan) {
      this.$emit("show-qr", qr_scan)
    }
  }
}
</script>

<style scoped>
.portion-header {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

.no-portion-text {
  text-align: center;
  font-weight: bold;
  font-size: 1.75rem;
  margin-top: 14rem;
  line-height: 2rem;
}
</style>