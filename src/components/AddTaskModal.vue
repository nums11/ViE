<template>
  <sui-modal v-model="show_modal">
    <sui-modal-header class="center-text">
      {{ header }}
    </sui-modal-header>
    <sui-modal-content scrolling class="center-text"
    style="padding-top: 0;">
      <sui-form class="form">
        <div id="radio-container">
          <p class="mb-2 mr-1">
            Choose the task type ({{ coming_soon_task}}
            coming soon).
          </p>
          <sui-form-fields inline>
            <sui-form-field>
              <div class="ui radio checkbox">
                <input type="radio" name="checked_value"
                checked="checked" class="cb-one" @click="selectValue(1)">
                <label for="cb-one">{{ radio_label_one }}</label>
              </div>
            </sui-form-field>
            <sui-form-field>
              <div class="ui radio checkbox">
                <input type="radio" name="checked_value"
                class="cb-two" @click="selectValue(2)" disabled>
                <label for="cb-two">{{ radio_label_two }}</label>
              </div>
            </sui-form-field>
          </sui-form-fields>
        </div>
        <div class="form-field" v-if='is_real_time'>
          <p class="mb-2">
            Schedule a reminder to receive a notification
            for this task (recommended)
          </p>
          <p v-if="show_default_notification_message">
            You currently do not have notifications enabled
            so you will not be able to receive a reminder.
            Click
            <span style="cursor:pointer" @click="requestNotificationPermission">
              <strong>here</strong>
            </span>
            to enable notifications.
          </p>
          <p v-if="show_denied_notification_message">
            You have denied notifications. In order to receive a reminder
            you must manually reenable notifications by clicking on
            the lock icon on the left side of your search bar and 
            setting notifications to 'Allow' or
            going into the site settings.
          </p>
          <sui-form-field>
            <label class="form-label">Schedule Reminder</label>
            <input type="datetime-local"
            id="reminder-input">
          </sui-form-field>
        </div>
        <div class="form-field" v-else>
          <sui-form-field required>
            <label class="form-label">Video Name</label>
            <input v-model="task.name" placeholder="Class Video">
          </sui-form-field>
          <sui-form-field>
            <input @change="setVideoFile" type="file" id="file-input">
          </sui-form-field>
        </div>
        <div class="form-field">
          <sui-button @click.prevent="clearInputs"
          style="margin-right:5rem;">
              Clear
          </sui-button>
          <sui-button @click.prevent="addTask"
          animated :disabled="!formComplete"
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
  </sui-modal>
</template>

<script>
import flatpickr from "flatpickr";
import 'flatpickr/dist/themes/material_blue.css';
import moment from 'moment'
import helpers from '@/helpers.js'

export default {
  name: 'AddTaskModal',
  mixins: [helpers],
  props: {
    is_real_time: {
      type: Boolean,
      required: true
    }
  },
  components: {
  },
  data () {
    return {
      show_modal: false,
      task: {
        reminder_time: null,
        video_file: null
      },
      value: 1,
      header: "",
      coming_soon_task: "",
      window_label: "",
      start_popup_text: "",
      end_popup_text: "",
      start: Date,
      end: Date,
      radio_label_one: "",
      radio_label_two: "",
      show_default_notification_message: false,
      show_denied_notification_message: false
    }
  },
  computed: {
    formComplete() {
      if(this.is_real_time) {
        return true
      } else {
        return this.task.name != null && 
        this.task.name !== '' &&
        this.task.video_file != null
      }
    }
  },
  created () {
    if(this.is_real_time) {
      this.getNotificationPermissionStatus()
    }
    this.setLabelsAndDates()
  },
  mounted() {
    this.initFlatPickr()
  },
  methods: {
    setLabelsAndDates() {
      let label_prefix = ""
      if(this.is_real_time) {
        label_prefix = "Real-Time"
        this.coming_soon_task = "quizzes"
        this.radio_label_one = "QR Scan"
        this.radio_label_two = "Quiz"
      } else {
        label_prefix = "Async"
        this.coming_soon_task = "links"
        this.radio_label_one = "Video"
        this.radio_label_two = "Link"
      }
      this.header = `Add ${label_prefix} Task`
    },
    initFlatPickr() {
      const self = this
      if(this.is_real_time) {
        self.reminder_picker = flatpickr('#reminder-input', {
          enableTime: true,
          dateFormat: "M/D, h:mm a",
          altInput: true,
          altFormat: "M/D, h:mm a",
          parseDate: (datestr, format) => {
            return moment(datestr, format, true).toDate();
          },
          formatDate: (date, format, locale) => {
            // locale can also be used
            return moment(date).format(format);
          },
          onChange: function (selected_dates) {
            self.updateTaskReminderTime(selected_dates)
          }
        })
      }
    },
    updateTaskReminderTime(new_times) {
      this.task.reminder_time = new_times[0]
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
      this.resetInputs()
      this.show_modal = false
    },
    resetInputs() {
      this.task = {
        reminder_time: null,
        video_file: null
      }
      if(this.is_real_time){
        this.reminder_picker.clear()
      } else {
        let file_input = document.getElementById('file-input')
        file_input.value = ''
      }
    },
    getNotificationPermissionStatus() {
      if(("Notification") in window) {
        console.log("permission", Notification.permission)
        if(Notification.permission === "default")
          this.show_default_notification_message = true
        else if(Notification.permission === "denied")
          this.show_denied_notification_message = true
      }
    },
    async requestNotificationPermission() {
     let permission = await Notification.requestPermission()
     if (permission === "granted") {
       this.notification_permission_status = "granted"
       this.show_default_notification_message = false
       this.registerServiceWorkerAndAddSubscription()
     } else if(permission === "default") {
       this.notification_permission_status = "default"
     } else {
       this.show_default_notification_message = false
       this.show_denied_notification_message = true
       this.notification_permission_status = "blocked"
     }
    },
    clearInputs() {
      this.task.name = null
      this.task.reminder_time = null
      this.task.video_file = null
      if(this.is_real_time){
        this.reminder_picker.clear()
      } else {
        let file_input = document.getElementById('file-input')
        file_input.value = ''
      }
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