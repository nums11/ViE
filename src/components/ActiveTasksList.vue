<template>
  <div class="active-tasks-list">
    <h3 v-if="active_tasks.length >0"
    class="inline-block active-tasks-header">Active Tasks:</h3>
    <h3 v-else class="inline-block active-tasks-header lighter">No Active Tasks</h3>
    <div class="inline-block active-task-container" v-for="task in active_tasks"
    :key="task._id">
      <!-- Recording Button -->
      <router-link v-if="task.qr_scan_start_time == null"
      :to="{name: 'watch_recording', params: {recording_id: task._id}}"
      @click="$emit('show-fullscreen-code',task.code)">
        <sui-button content="Watch Recording" icon="play circle"
        label-position="right" color="violet" />
      </router-link>
      <!-- QR Button -->
      <div v-else>
        <sui-button v-if="isPrivelegedUser()" 
        size="big"
        @click="$emit('show-fullscreen-code',task.code)"
        content="Show QR Code" icon="qrcode" label-position="right" color="teal" />
        <sui-button class="scan-qr-button" v-else
        size="big" 
        @click="$emit('show-qr-scanning-window')"
        content="Scan QR Code" icon="qrcode" label-position="right" color="teal" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ActiveTasksList',
  props: {
    active_tasks: {
      type: Array,
      required: true
    },
    for_course: {
     type: Boolean,
     required: true
    },
    is_board_member: {
     type: Boolean,
     required: true
    }
  },
  data () {
    return {
    }
  },
  created () {
    console.log("For course",this.for_course)
    console.log("Is board member",this.is_board_member)
    this.current_user = this.$store.state.user.current_user
    this.is_instructor = this.current_user.is_instructor
    console.log("Active Tasks", this.active_tasks)
  },
  methods: {
    isPrivelegedUser() {
      return (this.for_course && this.is_instructor) ||
      (!this.for_course && this.is_board_member)
    }
  }
}
</script>

<style lang="scss" scoped>
.active-tasks-list {
  margin-bottom: 2rem;

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