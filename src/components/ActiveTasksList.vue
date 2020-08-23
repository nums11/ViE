<template>
  <div class="active-tasks-list">
    <h3 v-if="active_tasks.length >0"
    class="inline-block active-tasks-header">Active Tasks:</h3>
    <h3 v-else class="inline-block active-tasks-header lighter">No Active Tasks</h3>
    <div class="inline-block active-task-container" v-for="task in active_tasks"
    :key="task._id">
      <!-- Recording Button -->
      <router-link v-if="task.qr_checkin_start_time == null"
      :to="{name: 'watch_recording', params: {recording_id: task._id}}"
      @click="$emit('show-fullscreen-code',task.code)">
        <sui-button content="Watch Recording" icon="play circle"
        label-position="right" color="violet" />
      </router-link>
      <!-- QR Button -->
      <div v-else @click="$emit('show-fullscreen-code',task.code)">
        <sui-button content="Show QR Code" icon="qrcode"
        label-position="right" color="teal" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ActiveTasksList',
  props: {
    active_tasks: Array
  },
  data () {
    return {
    }
  },
  created () {
    console.log("Active Tasks", this.active_tasks)
  },
  methods: {

  }
}
</script>

<style lang="scss" scoped>
.active-tasks-list {

  .active-tasks-header {
    margin-left: 2rem;
  }

  .lighter {
    color: #787878;
  }

  .active-task-container {
    margin-left: 2rem;
  }

}
</style>