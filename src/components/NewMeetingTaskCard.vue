<template>
  <div class="new-meeting-task-card-container">
    <sui-button @click="$emit('remove-task', index)"
    class="remove-btn" size="mini" color="red">
      <sui-icon name="x"/>
    </sui-button>
    <div v-if="is_qr" class="new-meeting-task-card inline-block">
      <sui-icon class="card-icon" name="qrcode" />
      <div class="float-left">QR Scan {{ index+1 }}</div>
      <div v-if="reminder_time == null">No Reminder</div>
      <div v-else>{{ reminder_time | moment("M/d h:mm a") }}</div>
    </div>
    <div v-else class="new-meeting-task-card inline-block">
      <sui-icon class="card-icon" name="play circle outline" />
      <div class="float-left">Video {{ index+1 }}</div>
      <div>10m 30s</div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'NewMeetingTaskCard',
  props: {
    is_qr: {
      type: Boolean,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    reminder_time: {
      type: String,
    }
  },
  components: {
  },
  data () {
    return {

    }
  },
  computed: {
  },
  created () {
  },
  methods: {

  }
}
</script>

<style scoped>
.new-meeting-task-card-container {
  /*border: green solid;*/
  width: 20rem;
  float: right;
  margin-bottom: 2rem;
}

.remove-btn {
  width: 2.75rem;
}

.new-meeting-task-card {
  border: #adadad solid thin;
  border-radius: 3px;
  height: 2rem;
  width: 16rem;
  padding-top: 0.3rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.card-icon {
  float: left;
  /*margin-left: 0.5rem;*/
}

</style>