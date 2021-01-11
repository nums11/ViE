<template>
  <div id="add-task-form">
    <sui-button @click="$emit('hide-form')"
    content="Cancel" icon="arrow left"
    label-position="left" />
    <sui-form class="form">
      <div class="form-field">
        <sui-form-field required>
        <sui-popup :content="start_popup_text" position="top center"
        inverted basic>
          <label slot="trigger" class="form-label">
            {{ start_label }}
          </label>
        </sui-popup>
          <input v-model="start" @change="updatePropTime('start')"
          type="datetime-local">
        </sui-form-field>
      </div>
      <div class="form-field">
        <sui-form-field required>
          <sui-popup :content="end_popup_text" position="top center"
          inverted basic>
            <label slot="trigger" class="form-label">
              {{ end_label }}
            </label>
          </sui-popup>
          <input v-model="end" @change="updatePropTime('end')"
          type="datetime-local">
        </sui-form-field>
      </div>
      <div id="radio-container">
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
              id="cb-two" @click="selectValue(2)">
              <label for="cb-two">{{ radio_label_two }}</label>
            </div>
          </sui-form-field>
        </sui-form-fields>
      </div>
      <div class="form-field" v-if='is_real_time'>
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
          <input @change="setVideoFile" type="file">
        </sui-form-field>
      </div>
      <div class="form-field">
        <sui-button @click.prevent="$emit('add-task', task)"
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
  </div>
</template>

<script>
export default {
  name: 'AddTaskForm',
  props: {
    real_time_portion: Object,
    async_portion: Object
  },
  components: {

  },
  data () {
    return {
      task: {
        reminder_time: null,
      },
      value: 1,
      is_real_time: Boolean,
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
        this.start = this.real_time_portion.real_time_start
        this.end = this.real_time_portion.real_time_end
        this.radio_label_one = "QR Scan"
        this.radio_label_two = "Quiz"
      } else {
        label_prefix = "Async"
        this.start = this.async_portion.async_start
        this.end = this.async_portion.async_end
        this.radio_label_one = "Video"
        this.radio_label_two = "Link"
      }
      this.setPopupText()
      this.start_label = `${label_prefix} start`
      this.end_label = `${label_prefix} end`
    },
    setPopupText() {
      let task_type = ""
      if(this.is_real_time)
        task_type = "real-time"
      else
        task_type = "async"
      this.start_popup_text = `Students can begin submitting `
        + `to ${task_type} tasks at this time`
      this.end_popup_text = `Students can no longer submit to `
                + `${task_type} tasks after this time`
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
    }
  }
}
</script>

<style scoped>
#add-task-form {
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