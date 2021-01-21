<template>
  <div class="meeting-info-portion-container">
    <div v-if="adding_task">
      <sui-loader active size="large">
        Adding Task
      </sui-loader>
    </div>
    <div v-else>
      <div class="portion-header">{{ portion_label }}</div>
      <div>
        <div v-if="portion != null"
        class="inline-block">
          {{ start | moment("MMM Do, h:mm a") }}
          - {{ end | moment("MMM Do, h:mm a") }}
        </div>
        <div v-else>
          No {{ portion_type }} Portion
        </div>
        <sui-button @click="showAddTaskModal"
          animated size="small"
          style="background-color:#00b80c; color:white;
          float:right;" :disabled="portion == null">
          <sui-button-content visible>
            Add {{ portion_type }} Tasks
          </sui-button-content>
          <sui-button-content hidden>
            <sui-icon :name="btn_icon_name" />
          </sui-button-content>
        </sui-button>
      </div>
      <div v-if="(is_real_time && portion != null)
        || (!is_real_time && portion != null)">
        <SubmissionTable v-if="show_submission_table"
        :task="table_task"
        :is_qr="is_real_time"
        :student_ids="meeting_student_ids"
        v-on:hide-submission-table="hideSubmissionTable" />
        <MeetingTasksContainer v-else
        :task_type="is_real_time ? 'qr_scan' : 'video'"
        :tasks="portion_tasks" :portion="portion"
        v-on:show-qr="showQR"
        v-on:view-submissions="viewSubmissions" />
      </div>
      <div class="add-portion-btn-container" v-else>
        <sui-button @click="showAddPortionModal"
        size="large" animated
        style="background-color:#00B3FF; color:white;">
            <sui-button-content visible>
              Add {{ portion_type.toLowerCase() }} portion
            </sui-button-content>
            <sui-button-content hidden>
                <sui-icon :name="btn_icon_name" />
            </sui-button-content>
        </sui-button>
      </div>
      <div v-if="portion != null">
        <AddTaskModal v-if="is_real_time"
        ref="AddTaskModal" :real_time_portion="portion"
        v-on:add-task="addTask('qr_scan', ...arguments)" />
        <AddTaskModal v-else
        ref="AddTaskModal" :async_portion="portion"
        v-on:add-task="addTask('video', ...arguments)" />
      </div>
      <AddPortionModal v-if="portion == null"
      ref="AddPortionModal" :is_real_time="is_real_time"
      v-on:add-portion="addPortion" />
    </div>
  </div>
</template>

<script>
import MeetingTasksContainer from 
'@/components/MeetingTasksContainer'
import SubmissionTable from
'@/components/SubmissionTable.vue';
import AddTaskModal from '@/components/AddTaskModal.vue';
import RealTimePortionAPI from
'@/services/RealTimePortionAPI'
import AsyncPortionAPI from
'@/services/AsyncPortionAPI'
import AddPortionModal from
'@/components/AddPortionModal'
import MeetingAPI from '@/services/MeetingAPI'

export default {
  name: 'MeetingInfoPortionContainer',
  props: {
    portion: Object,
    meeting_id: {
      type: String,
      required: true
    },
    is_real_time: {
      type: Boolean,
      default: false
    },
    meeting_student_ids: {
      type: Set,
      required: true
    }
  },
  components: {
    MeetingTasksContainer,
    SubmissionTable,
    AddTaskModal,
    AddPortionModal
  },
  data () {
    return {
      show_submission_table: false,
      table_task: null,
      portion_label: "",
      portion_type: "",
      btn_icon_name: "",
      portion_tasks: [],
      start: null,
      end: null,
      adding_task: false
    }
  },
  created () {
    this.setLabelsAndDates()
  },
  methods: {
    setLabelsAndDates() {
      if(this.is_real_time) {
        this.portion_type = "Real-Time"
        this.btn_icon_name = "podcast"
      } else {
        this.portion_type = "Async"
        this.btn_icon_name = "clock"
      }
      if(this.portion != null)
        this.setPortionTimesAndTasks()
      this.portion_label = `${this.portion_type} Portion`
    },
    setPortionTimesAndTasks() {
      this.$nextTick(function () {
        if(this.is_real_time) {
          this.start = this.portion.real_time_start
          this.end = this.portion.real_time_end
          this.portion_tasks = this.portion.qr_scans
        } else {
          this.start = this.portion.async_start
          this.end = this.portion.async_end
          this.portion_tasks = this.portion.videos
        }
      })
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
    },
    showAddTaskModal() {
      this.$refs.AddTaskModal.showModal()
    },
    async addTask(task_type, task) {
      this.adding_task = true
      if(task_type === 'qr_scan'){
        if(task.reminder_time === '')
          task.reminder_time = null
        try {
          const response = await RealTimePortionAPI.addQRScan(
            this.portion._id, task)
          const new_qr_scan = response.data
          this.portion.qr_scans.push(new_qr_scan)
        } catch(error) {
          console.log(error)
          alert("Sorry, something went wrong")
        }
      } else {
        try {
          let response =
            await MeetingAPI.saveVideoToGCS(task.video_file)
          const video_url = response.data
          task.url = video_url
          response = await AsyncPortionAPI.addVideo(
            this.portion._id, task)
          const new_video = response.data
          this.portion.videos.push(new_video)
        } catch(error) {
          console.log(error)
          alert("Sorry, something went wrong")
        }
      }
      this.adding_task = false
    },
    showAddPortionModal() {
      this.$refs.AddPortionModal.showModal()
    },
    async addPortion(portion) {
      try {
        const response = await MeetingAPI.addPortion(
          this.meeting_id, portion, this.is_real_time)
        const new_portion = response.data
        // this.portion = new_portion
        this.$emit('set-new-portion',new_portion)
      } catch(error){
        console.log(error)
        alert("Sorry, something went wrong")
      }
    }
  }
}
</script>

<style scoped>
.portion-header {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

.add-portion-btn-container {
  text-align: center;
  font-weight: bold;
  font-size: 1.75rem;
  margin-top: 14rem;
  line-height: 2rem;
}
</style>