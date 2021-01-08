<template>
  <div class="meeting-tasks-container">
    <div class="header" v-if="task_type === 'qr_scan'">
      QR Scans ({{ tasks.length }})
    </div>
    <div class="task-cards">
      <MeetingTaskCard v-for="(task, index) in tasks"
      :key="index" :task="task" :index="index"
      v-on:show-qr="$emit('show-qr',task)" />
    </div>
  </div>
</template>

<script>
import MeetingTaskCard from '@/components/MeetingTaskCard'

export default {
  name: 'MeetingTasksContainer',
  props: {
    task_type: {
      type: String,
      required: true
    },
    tasks: {
      type: Array,
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