<template>
  <div class="new-meeting-task-card-container">
    <sui-button @click="$emit('remove-task', index)"
    class="remove-btn" size="mini" color="red">
      <sui-icon name="x"/>
    </sui-button>
    <div class="new-meeting-task-card inline-block">
      <sui-icon class="card-icon" :name="icon_name" />
      <div class="float-left left-side-label wrap-text">
        {{ left_side_label }}
      </div>
      <div class="float-right right-side-label wrap-text">
        {{ right_side_label }}
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'NewMeetingTaskCard',
  props: {
    task_type: {
      type: String,
      required: true
    },
    index: {
      type: Number,
    },
    task: {
      type: Object,
      required: true
    }
  },
  components: {
  },
  data () {
    return {
      icon_name: "",
      left_side_label: "",
      right_side_label: ""
    }
  },
  computed: {
  },
  created () {
    this.setLabelsBasedOnTaskType()
  },
  methods: {
    setLabelsBasedOnTaskType() {
      if(this.task_type === 'qr_scan') {
        this.icon_name = "qrcode"
        this.left_side_label = `QR Scan ${this.index + 1}`
        this.right_side_label =
          this.task.reminder_time === null ?
            'No Reminder' :
            moment(this.task.reminder_time).format(
              "M/D h:mm a")
      } else if(this.task_type === 'quiz') {
        this.icon_name = "pencil alternate"
        this.left_side_label = this.task.name
        const num_questions = this.task.questions.length
        this.right_side_label =
          `${num_questions} question`
        if(num_questions > 1)
          this.right_side_label += 's'
      } else {
        this.icon_name = "play circle outline"
        this.left_side_label = this.task.name
        this.right_side_label = this.task.video_file.name
      }
    }
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
}

.left-side-label {
  width: 45%;
  text-align: left;
}

.right-side-label {
  width: 45%;
}
</style>