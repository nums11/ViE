<template>
  <div class="meeting-task-card-container">
    <div class="meeting-task-card light-border-shadow">
      <div class="meeting-title wrap-text">
        QR Scan {{ index + 1 }}
      </div>
      <div v-if="task.reminder_time == null" 
      class="reminder-container inline-block">
        No Scheduled Reminder
      </div>
      <div v-else 
      class="reminder-container inline-block">
        Reminder: {{ task.reminder_time | moment("M/D, h:mm a") }}
      </div>
      <div class="divider"></div>
      <div class="btn-container">
        <sui-button @click="$emit('show-qr')"
        animated size="mini"
        style="background-color:#00B3FF; color:white;">
          <sui-button-content visible>
            Show QR
          </sui-button-content>
          <sui-button-content hidden>
              <sui-icon name="qrcode" />
          </sui-button-content>
        </sui-button>
      </div>
      <div class="divider"></div>
      <div class="btn-container">
        <sui-button animated size="mini"
        style="background-color:#00B3FF; color:white;">
          <sui-button-content visible>
            View Submissions
          </sui-button-content>
          <sui-button-content hidden>
              <sui-icon name="arrow right" />
          </sui-button-content>
        </sui-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MeetingTaskCard',
  props:{
    task: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  data: function () {
      return {
        course_subject_code: null,
        course_number: null,
        course_name: null
      }
  },
  created () {
  },
  methods: {
  }
}
</script>

<style scoped>
.meeting-task-card-container {
  width: 37rem;
  display: inline-block;
  vertical-align: top;
  /*border: blue solid;*/
}

.meeting-task-card {
  border-radius: 3px;
  margin-top: 2rem;
  height: 2.75rem;
  display: inline-block;
  width: 36rem;
  padding-left: 0.45rem;
  padding-right: 0.2rem;
  padding-top: 0.35rem;
}

.meeting-title {
  display: inline-block;
  vertical-align: top;
  margin-top: 0.2rem;
  font-size: 1.15rem;
  color: #252b36bf;
  font-weight: bold;
  /*border: orange solid;*/
  width: 8rem;
}

.reminder-container {
  margin-top: 0.3rem;
  font-size: 0.9rem;
}

.icon-section {
  display: inline-block;
  /*border: black solid;*/
  margin-top: 0.5rem;
  /*margin-left: 2rem;*/
  width: 4.5rem;
}

.divider {
  border-left: #c7c7c7 solid thin;
  background-color: #c7c7c7;
  height: 90%;
  width: 0.005rem;
  display: inline-block;
  vertical-align: top;
  margin-left: 0.5rem;
}

.btn-container {
  display: inline-block;
  vertical-align: top;
  /*border: red solid;*/
  margin-left: 0.65rem;
}

/*meeting-task-card:not(:first-child) {
  margin-left: 3rem;
}*/
</style>
