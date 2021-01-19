<template>
  <sui-modal v-model="show_modal">
    <sui-modal-header class="center-text">
      {{ header }}
    </sui-modal-header>
    <sui-modal-content scrolling class="center-text"
    style="padding-top: 0;">
      <sui-form class="form">
        <p>{{ time_window_text }}</p>
        <div class="form-field">
          <sui-form-field required>
            <label class="form-label">
              {{ start_label }}
            </label>
            <input v-model="start" @change="updatePropTime('start')"
            type="datetime-local">
          </sui-form-field>
        </div>
        <div class="form-field">
          <sui-form-field required>
            <label class="form-label">
              {{ end_label }}
            </label>
            <input v-model="end" @change="updatePropTime('end')"
            type="datetime-local">
          </sui-form-field>
        </div>
        <div id="radio-container">
          <p class="mb-2 mr-1">
            Choose the task type ({{ coming_soon_task}}
            coming soon).
          </p>
          <sui-form-fields inline>
            <sui-form-field>
              <div class="ui radio checkbox">
                <input type="radio" name="checked_value"
                checked="checked" id="cb-one" @click="selectValue(1)">
                <label for="cb-one">{{ radio_label_one }}</label>
              </div>
            </sui-form-field>
            <sui-form-field>
              <div class="ui radio checkbox">
                <input type="radio" name="checked_value"
                id="cb-two" @click="selectValue(2)" disabled>
                <label for="cb-two">{{ radio_label_two }}</label>
              </div>
            </sui-form-field>
          </sui-form-fields>
        </div>
        <div class="form-field" v-if='is_real_time'>
          <p class="mb-2">
            Optionally schedule a reminder to receive a notification
            for this task.
          </p>
          <sui-form-field>
            <label class="form-label">Schedule Reminder</label>
            <input v-model="task.reminder_time" type="datetime-local">
          </sui-form-field>
        </div>
        <div class="form-field" v-else>
          <sui-form-field>
            <label class="form-label">Video Name</label>
            <input v-model="task.name" placeholder="Class Video">
          </sui-form-field>
          <sui-form-field>
            <input @change="setVideoFile" type="file" id="file-input">
          </sui-form-field>
        </div>
        <div class="form-field">
          <sui-button @click.prevent="addTask"
          animated
          style="background-color:#00b80c; color:white;">
            <sui-button-content visible>
              Add Task
            </sui-button-content>
            <sui-button-content hidden>
              <sui-icon name="podcast" />
            </sui-button-content>
          </sui-button>
        </div>
      </sui-form>
    </sui-modal-content>
    <sui-modal-actions>
      <sui-button @click="hideModal"
      style="background-color:#00B3FF; color:white;">
        Done
      </sui-button>
    </sui-modal-actions>
  </sui-modal>
</template>

<script>
export default {
  name: 'AddTaskModal',
  props: {
    real_time_portion: Object,
    async_portion: Object
  },
  components: {

  },
  data () {
    return {
      show_modal: false,
      task: {
        reminder_time: null,
      },
      value: 1,
      is_real_time: Boolean,
      header: "",
      time_window_text: "",
      coming_soon_task: "",
      start_label: "",
      end_label: "",
      start_popup_text: "",
      end_popup_text: "",
      start: Date,
      end: Date,
      radio_label_one: "",
      radio_label_two: ""
    }
  },
  computed: {
  },
  created () {
    this.is_real_time = this.real_time_portion != null
    this.setLabelsAndDates()
  },
  methods: {
    setLabelsAndDates() {
      let label_prefix = ""
      if(this.is_real_time) {
        label_prefix = "Real-Time"
        this.time_window_text = "Choose the time window"
          + " for the real-time portion of your meeting"
        this.coming_soon_task = "quizzes"
        this.start = this.real_time_portion.real_time_start
        this.end = this.real_time_portion.real_time_end
        this.radio_label_one = "QR Scan"
        this.radio_label_two = "Quiz"
      } else {
        label_prefix = "Async"
        this.time_window_text = "Choose the time window"
          + " for which students will be able to submit"
          + " to async tasks"
        this.coming_soon_task = "links"
        this.start = this.async_portion.async_start
        this.end = this.async_portion.async_end
        this.radio_label_one = "Video"
        this.radio_label_two = "Link"
      }
      this.header = `Add ${label_prefix} Task`
      this.start_label = `${label_prefix} start`
      this.end_label = `${label_prefix} end`
    },
    updatePropTime(time) {
      if(time === "start") {
        if(this.is_real_time)
          this.real_time_portion.real_time_start = this.start
        else
          this.async_portion.async_start = this.start
      } else {
        if(this.is_real_time)
          this.real_time_portion.real_time_end = this.end
        else
          this.async_portion.async_end = this.end
      }
    },
    setVideoFile (e) {
      // todo check if valid file extension
      this.task.video_file = e.target.files[0]
    },
    selectValue(value) {
      this.value = value
    },
    addTask(){
      this.$emit('add-task', this.task)
      this.hideModal()
    },
    showModal() {
      this.show_modal = true
    },
    hideModal() {
      this.task = {
        reminder_time: null
      }
      document.getElementById('file-input').value = ''
      this.show_modal = false
    }
  }
}
</script>

<style scoped>
#add-task-modal {
  margin-top: 2rem;
}
.form {
  /*border: black solid;*/
  /*width: 80%;*/
}

.date-input {
  margin-left: 1rem;
  margin-right: 1rem;
  width: 13rem;
}

#radio-container {
  width: 12rem;
  margin: auto;
  margin-top: 3rem;
}
</style>