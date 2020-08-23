<template>
  <div class="active-tasks-list">
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
.active-task-container {
  margin-left: 2rem;
}
</style>