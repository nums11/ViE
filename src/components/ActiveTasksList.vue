<template>
  <div class="active-tasks-list">
    <div class="inline-block active-task-container" v-for="task in active_tasks"
    :key="task._id">
      <sui-button v-if="task.qr_checkin_start_time == null" icon="play circle" label-position="left">
        <a is="sui-label" slot="label" basic>Watch Recording</a>
      </sui-button>
      <sui-button v-else icon="qrcode" label-position="left">
        <a is="sui-label" slot="label" basic>Show QR Code</a>
      </sui-button>
    </div>
  </div>
</template>

<script>
import QrCodeSVG from "@/assets/icons/001-qr-code.svg"
import RecordingSVG from "@/assets/icons/003-play-button.svg"

export default {
  name: 'ActiveTasksList',
  props: {
    active_tasks: Array
  },
  data () {
    return {
      QrCodeSVG: QrCodeSVG,
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