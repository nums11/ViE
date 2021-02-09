<template>
  <div class="portion-dropdown mt-2" @click="toggleList(false)">
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
    <sui-icon :name="async_caret_name"
    class="caret-icon float-right" />
  </div>
  <div v-if="show_async_list && meeting.async_portion != null">
    <MeetingTasksContainer 
    :meeting_id="meeting._id" task_type="video"
    :tasks="meeting.async_portion.videos"
    :portion="meeting.async_portion" />
  </div>
</template>

<script>
import MeetingTasksContainer from '@/components/MeetingTasksContainer'
import moment from 'moment'

export default {
  name: 'MobileMeetingInfoPortionContainer',
  props: {
    portion: {
      type: Object,
      required: true
    }
    meeting_id: {
      type: String,
      required: true
    },
    is_real_time : {
      type: Boolean,
      required: true
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
      real_time_caret_name: "caret down",
      async_caret_name: "caret down",
      show_real_time_cant_submit_yet_msg: false,
      show_async_cant_submit_yet_msg: false
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
    toggleList(is_real_time) {
      if(is_real_time) {
        this.show_real_time_list = !this.show_real_time_list
        if(this.show_real_time_list)
          this.real_time_caret_name = "caret down"
        else
          this.real_time_caret_name = "caret up"
      } else {
        this.show_async_list = !this.show_async_list
        if(this.show_async_list)
          this.async_caret_name ="caret down"
        else
          this.async_caret_name = "caret up"
      }
    }
  }
}
</script>

<style scoped>
.portion-dropdown {
  border: #c7c7c7 solid thin;
  border-radius: 3px;
  height: 3rem;
  padding-left: 0.5rem;
  padding-right: 0.25rem;
}

.portion-text {
  /*font-size: 1.15rem;*/
  text-align: left;
  margin-top: 0.75rem;
  /*border: black solid;*/

}

.portion-times {
  font-size: 0.95rem; 
  margin-top: 0.75rem;
}

.caret-icon {
  /*border: blue solid;*/
  /*margin-left: 1rem;*/
  margin-top: 0.7rem;
}
</style>