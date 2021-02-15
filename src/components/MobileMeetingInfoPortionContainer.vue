<template>
  <div>
    <div class="portion-dropdown mt-2" @click="toggleList">
      <div class="portion-text inline-block float-left bold">
        {{ portion_label }}
      </div>
      <div v-if="portion != null"
      class="portion-times inline-block">
        {{ start | moment("M/D h:mm a") }}
        - {{ end| moment("M/D h:mm a") }}
      </div>
      <div v-else class="portion-times inline-block">
        No Async Portion
      </div>
      <sui-icon :name="caret_name"
      class="caret-icon float-right" />
    </div>
    <div v-if="show_list && portion != null">
      <div v-if="is_real_time">
        <MeetingTasksContainer 
        :meeting_id="meeting_id" task_type="qr_scan"
        :tasks="qr_scans"
        :portion="portion" />
        <MeetingTasksContainer 
        :meeting_id="meeting_id" task_type="quiz"
        :tasks="quizzes"
        :portion="portion" />
      </div>
      <MeetingTasksContainer v-else
      :meeting_id="meeting_id" task_type="video"
      :tasks="videos"
      :portion="portion" />
    </div>
  </div>
</template>

<script>
import MeetingTasksContainer from '@/components/MeetingTasksContainer'
import moment from 'moment'

export default {
  name: 'MobileMeetingInfoPortionContainer',
  props: {
    portion: Object,
    meeting_id: {
      type: String,
      required: true
    },
    is_real_time: {
      type: Boolean,
      default: false
    }
  },
  components: {
    MeetingTasksContainer,
  },
  data () {
    return {
      portion_label: "",
      start: null,
      end: null,
      show_list: true,
      caret_name: "caret down",
      qr_scans: [],
      quizzes: [],
      videos: []
    }
  },
  created() {
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
    toggleList() {
      this.show_list = !this.show_list
      if(this.show_list)
        this.caret_name = "caret down"
      else
        this.caret_name = "caret up"
    }
  }
}
</script>

<style scoped>
.portion-dropdown {
  border: #c7c7c7 solid thin;
  border-radius: 3px;
  min-height: 3rem;
  padding-left: 0.5rem;
  padding-right: 0.25rem;
}

.portion-text {
  text-align: left;
  margin-top: 0.75rem;

}

.portion-times {
  font-size: 0.95rem; 
  margin-top: 0.75rem;
}

.caret-icon {
  margin-top: 0.7rem;
}
</style>