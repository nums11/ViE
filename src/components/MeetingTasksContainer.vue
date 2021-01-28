<template>
  <div class="meeting-tasks-container">
    <div class="header">
      {{ task_type === 'qr_scan' ? 'QR Scans' : 'Videos' }}
       ({{ tasks.length }})
    </div>
    <div class="task-cards">
      <MeetingTaskCard v-for="(task, index) in tasks"
      :meeting_id="meeting_id"
      :key="index" :task="task" :index="index" :portion="portion"
      :task_type="task_type" v-on:show-qr="$emit('show-qr',task)"
      v-on:view-submissions="$emit('view-submissions',task)" />
    </div>
  </div>
</template>

<script>
import MeetingTaskCard from '@/components/MeetingTaskCard'

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

    }
  },
  async created () {

  },
  mounted () {
  },
  methods: {

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

.task-cards {
  width: 97%;
  margin: auto;
}
</style>