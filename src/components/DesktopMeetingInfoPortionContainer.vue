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
        <sui-button v-if="is_instructor" @click="showAddTaskModal"
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
      <div v-if="portion != null">
        <div v-if="portion_times_and_tasks_set">
          <div v-if="show_submission_table">
            <QRSubmissionTable v-if="table_task_type === 'qr_scan'"
            :task="table_task"
            :meeting_students="meeting_students"
            v-on:hide-submission-table="hideSubmissionTable" />
            <VideoQuizSubmissionTable
            v-else-if="table_task_type === 'video' ||
            table_task_type === 'quiz'"
            :is_video="table_task_type === 'video'"
            :task="table_task"
            :meeting_students="meeting_students"
            v-on:hide-submission-table="hideSubmissionTable" />
          </div>
          <TaskStats v-else-if="show_task_stats"
          :task="stats_task" :task_type="stats_task_type"
          :meeting_students="meeting_students"
          v-on:hide-stats="hideStats" />
          <div v-else>
            <div v-if="is_real_time">
              <MeetingTasksContainer 
              :meeting_id="meeting_id"
              task_type="qr_scan"
              :tasks="qr_scans" :portion="portion"
              v-on:show-qr="showQR"
              v-on:view-submissions="viewSubmissions"
              v-on:show-stats="showStats" />
              <MeetingTasksContainer 
              :meeting_id="meeting_id"
              task_type="quiz"
              :tasks="quizzes" :portion="portion"
              v-on:view-submissions="viewSubmissions"
              v-on:show-stats="showStats" />
            </div>
            <MeetingTasksContainer v-else
            :meeting_id="meeting_id"
            task_type="video"
            :tasks="videos" :portion="portion"
            v-on:view-submissions="viewSubmissions"
            v-on:show-stats="showStats" />
          </div>
        </div>
        <AddTaskModal ref="AddTaskModal"
        :is_real_time="is_real_time"
        v-on:add-task="addTask" />
      </div>
      <div class="add-portion-btn-container" v-else>
        <sui-button v-if="is_instructor" @click="showAddPortionModal"
        size="large" animated
        style="background-color:#00B3FF; color:white;">
            <sui-button-content visible>
              Add {{ portion_type.toLowerCase() }} portion
            </sui-button-content>
            <sui-button-content hidden>
                <sui-icon :name="btn_icon_name" />
            </sui-button-content>
        </sui-button>
        <AddPortionModal ref="AddPortionModal"
        :is_real_time="is_real_time"
        v-on:add-portion="addPortion" />
      </div>
    </div>
  </div>
</template>

<script>
import MeetingTasksContainer from 
'@/components/MeetingTasksContainer'
import AddTaskModal from '@/components/AddTaskModal.vue';
import RealTimePortionAPI from
'@/services/RealTimePortionAPI'
import AsyncPortionAPI from
'@/services/AsyncPortionAPI'
import AddPortionModal from
'@/components/AddPortionModal'
import MeetingAPI from '@/services/MeetingAPI'
import QRSubmissionTable from
'@/components/QRSubmissionTable'
import VideoQuizSubmissionTable from
'@/components/VideoQuizSubmissionTable'
import TaskStats from '@/components/TaskStats'

export default {
  name: 'DesktopMeetingInfoPortionContainer',
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
    instructor_ids: Array,
    meeting_students: {
      type: Set,
      required: true
    }
  },
  components: {
    MeetingTasksContainer,
    QRSubmissionTable,
    VideoQuizSubmissionTable,
    AddTaskModal,
    AddPortionModal,
    TaskStats
  },
  data () {
    return {
      show_submission_table: false,
      table_task: null,
      table_task_type: null,
      show_task_stats: false,
      stats_task: null,
      stats_task_type: null,
      portion_label: "",
      portion_type: "",
      btn_icon_name: "",
      qr_scans: [],
      quizzes: [],
      videos: [],
      start: null,
      end: null,
      adding_task: false,
      adding_video: false,
      portion_times_and_tasks_set: false
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
          this.qr_scans = this.portion.qr_scans
          this.quizzes = this.portion.quizzes
        } else {
          this.start = this.portion.async_start
          this.end = this.portion.async_end
          this.videos = this.portion.videos
        }
        this.portion_times_and_tasks_set = true
      })
    },
    viewSubmissions(task, task_type) {
      this.table_task = task
      this.table_task_type = task_type
      this.show_submission_table = true
    },
    hideSubmissionTable() {
      this.show_submission_table = false
      this.table_task = null
      this.table_task_type = null
    },
    showQR(qr_scan) {
      this.$emit("show-qr", qr_scan)
    },
    showAddTaskModal() {
      this.$refs.AddTaskModal.showModal()
    },
    addTask(task_type, task) {
      if(task_type === 'qr_scan'){
        this.addQRScan(task)
      } else if(task_type === 'quiz') {
        this.addQuiz(task)
      } else {
        this.addVideo(task)
      }
    },
    async addQRScan(task) {
      this.adding_task = true
      if(task.reminder_time === '')
        task.reminder_time = null
      try {
        const response = await RealTimePortionAPI.addQRScan(
          this.portion._id, task, this.meeting_id,
          this.instructor_ids)
        const new_qr_scan = response.data
        this.portion.qr_scans.push(new_qr_scan)
      } catch(error) {
        console.log(error)
        window.alert("Sorry, something went wrong")
      }
      this.adding_task = false
    },
    async addQuiz(task) {
      this.adding_task = true
      try {
        const response = await RealTimePortionAPI.addQuiz(
          this.portion._id, task)
        const new_quiz = response.data
        this.portion.quizzes.push(new_quiz)
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong")
      }
      this.adding_task = false
    },
    async addVideo(task) {
      this.$emit('show-lottie-player')
      try {
        let response =
          await MeetingAPI.saveVideoToGCS(task.video_file)
        const video_url = response.data
        task.url = video_url
        response = await AsyncPortionAPI.addVideo(
          this.portion._id, task)
        const new_video = response.data
        this.portion.videos.push(new_video)
        this.$emit('hide-lottie-player')
      } catch(error) {
        console.log(error)
        window.alert("Sorry, something went wrong")
        this.$emit('hide-lottie-player')
      }
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
        window.alert("Sorry, something went wrong")
      }
    },
    showStats(task, task_type) {
      this.show_task_stats = true
      this.stats_task = task
      this.stats_task_type = task_type
    },
    hideStats() {
      this.show_task_stats = false
      this.stats_task = null
      this.stats_task_type = null
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