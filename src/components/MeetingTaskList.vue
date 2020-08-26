<template>
<div class="meeting-task-list">
  <TaskInfoContainer 
  v-for="(task,i) in is_instructor ? tasks : closed_and_active_tasks"
  :key="task._id"
  :task_number="i"
  :task="task"
  :is_qr="is_live"
  :attendees="attendees"
  v-on:show-task-qr="(task) => $emit('show-task-qr',task)"
  v-on:show-qr-scanning-window="$emit('show-qr-scanning-window')"
  v-on:show-task-attendance="(task) => $emit('show-task-attendance',task)" />
  </div>
</template>

<script>
import TaskInfoContainer from '@/components/TaskInfoContainer.vue'

export default {
  name: 'MeetingTaskList',
  props: {
    tasks: {
      type: Array,
      required: true
    },
    is_live: {
      type: Boolean,
      required: true
    },
    attendees: {
      type: Array,
      required: true
    }
  },
  components: {
    TaskInfoContainer
  },
  data () {
    return {
      closed_and_active_tasks: []
    }
  },
  created () {
    this.current_user = this.$store.state.user.current_user
    this.is_instructor = this.current_user.is_instructor
    // Only show open and closed checkins to students. No upcoming
    if(!this.is_instructor)
      this.getClosedAndActiveTasksForStudent()
  },
  methods: {
    getClosedAndActiveTasksForStudent() {
      this.tasks.forEach(task => {
        let window_status = this.getWindowStatus(this.tasks, this.is_live)
        if(window_status === 'open' || window_status === 'closed')
          this.closed_and_active_tasks.push(task)
      })
    },
    getWindowStatus(task, is_qr) {
      let current_time = new Date()
      let window_start = null
      let window_end = null
      if(is_qr) {
        window_start = new Date(task.qr_checkin_start_time)
        window_end = new Date(task.qr_checkin_end_time)
      } else {
        window_start = new Date(task.recording_submission_start_time)
        window_end = new Date(task.recording_submission_end_time)
      }
      let window_status = ""
      if(current_time > window_end)
        window_status = "closed"
      else if(current_time < window_start)
        window_status = "upcoming"
      else
        window_status = "open"
      return window_status
    },
  }
}
</script>

<style lang="scss" scoped>

</style>