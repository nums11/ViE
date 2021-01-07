<template>
  <div class="new-meeting-task-card-container">
    <sui-button class="remove-btn" size="mini"
    color="red">
      <sui-icon name="x"/>
    </sui-button>
    <div class="new-meeting-task-card inline-block">
      <sui-icon class="card-icon" name="qrcode" />
      <div class="float-left">QR Scan 1</div>
      <div>No Reminder</div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'NewMeetingTaskCard',
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
  cursor: pointer;
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