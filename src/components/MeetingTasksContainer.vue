<template>
  <div class="meeting-tasks-container">
    <div class="header">{{ container_header }}</div>
    <p v-if="show_cant_submit_yet_msg" id="cant-submit-yet-msg">
      You will be able to submit to these tasks once the
      portion window opens on {{ portion_start | moment("MMM Do") }}
      at {{ portion_start | moment("h:mm a") }}.
    </p>
    <div class="task-cards">
      <MeetingTaskCard v-for="(task, index) in tasks"
      :meeting_id="meeting_id"
      :key="index" :task="task" :index="index" :portion="portion"
      :task_type="task_type" v-on:show-qr="$emit('show-qr',task)"
      v-on:view-submissions="$emit('view-submissions',task)"
      :window_is_open="!show_cant_submit_yet_msg" />
    </div>
  </div>
</template>

<script>
import MeetingTaskCard from '@/components/MeetingTaskCard'
import moment from 'moment'

export default {
  name: 'MeetingTasksContainer',
  props: {
    meeting_id: {
      type: String,
      required: true
    },
    task_type: {
      type: String,
      required: true
    },
    tasks: {
      type: Array,
      required: true
    },
    portion: {
      type: Object,
      required: true
    }
  },
  components: {
    MeetingTaskCard
  },
  data () {
    return {
      container_header: "",
      show_cant_submit_yet_msg: false,
      portion_start: null
    }
  },
  async created () {
    this.setContainerHeader()
    this.showCantSubmitYetMsg()
  },
  mounted () {
  },
  methods: {
    setContainerHeader() {
      const num_tasks = this.tasks.length
      if(this.task_type === 'qr_scan')
        this.container_header = `QR Scans (${num_tasks})`
      else if(this.task_type === 'quiz')
        this.container_header = `Quizzes (${num_tasks})`
      else if(this.task_type === 'video')
        this.container_header = `Videos (${num_tasks})`
    },
    showCantSubmitYetMsg() {
      if(this.state_user.is_instructor ||
        this.tasks.length === 0)
        return
      if(this.portion.real_time_start != null)
        this.portion_start = this.portion.real_time_start
      else
        this.portion_start = this.portion.async_start
      const current_time = Date.now()
      if(moment(current_time).isBefore(this.portion_start))
        this.show_cant_submit_yet_msg = true
    }
  },
}
</script>

<style scoped>
.meeting-tasks-container {
  /*border: red solid;*/
  margin-top: 4rem;
}

.header {
  font-size: 1.5rem;
}

#cant-submit-yet-msg {
  margin-top: 1rem;
  margin-bottom: 0rem;
  font-weight: bold;
  color: #252B36BF;
}

.task-cards {
  width: 97%;
  margin: auto;
}

/* Phones */
@media (max-width: 744px) {
  .meeting-tasks-container {
    margin-top: 2rem;
  }
  .task-cards {
    width: 100%;
  }
}
</style>