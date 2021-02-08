<template>
  <sui-modal v-model="show_modal">
    <sui-modal-header class="center-text">
      {{ header }}
    </sui-modal-header>
    <sui-modal-content scrolling class="center-text"
    style="padding-top: 0;">
      <sui-form class="add-task-form">
        <div id="radio-container">
          <p class="mb-2 mr-1">
            Choose the task type
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
                class="cb-two" @click="selectValue(2)" :disabled="!is_real_time">
                <label for="cb-two">{{ radio_label_two }}</label>
              </div>
            </sui-form-field>
          </sui-form-fields>
        </div>
        <div class="form-field" v-if='is_real_time'>
          <div v-if="value === 1">
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
            <sui-form-field class="add-task-form-field">
              <label class="form-label">Schedule Reminder</label>
              <input type="datetime-local"
              id="reminder-input">
            </sui-form-field>
          </div>
          <AddQuizForm v-else />
        </div>
        <div class="form-field" v-else>
          <sui-form-field class="add-task-form-field" required>
            <label class="form-label">Video Name</label>
            <input v-model="task.name" placeholder="Class Video">
          </sui-form-field>
          <div class="mt-2">
            <sui-form-field class="add-task-form-field" required>
              <label class="form-label">Video File (.mp4)</label>
              <input @change="setVideoFile" type="file" id="file-input"
              accept=".mp4">
            </sui-form-field>
          </div>
          <div class="mt-2">
            <sui-form-field>
              <sui-popup content="Checking this box will allow students
              who scan qr codes to skip through this video freely, without
              any restrictions." position="top left" inverted>
                <sui-checkbox label="Allow students with real-time
                submissions to watch without restrictions" slot="trigger"
                v-model="task.allow_unrestricted_viewing_for_real_time_submitters" />
              </sui-popup>
            </sui-form-field>
          </div>
          <div class="mt-2">
            <sui-form-field>
              <sui-popup content="Checking this box will allow students to
              view the video in up to 2x speed. This option is automatically
              enabled after students watch 100% of the video." inverted>
                <sui-checkbox label="Allow faster viewing (up to 2x) speed"
                slot="trigger"
                v-model="task.allow_faster_viewing" />
              </sui-popup>
            </sui-form-field>
          </div>
          <div v-if="!is_real_time" class="mt-2">
            <sui-form-field v-if="task.quiz == null">
              <sui-button @click.prevent="showAddVideoQuizModal"
              :disabled="disableAddQuizBtn"
              size="small" animated
              style="background-color:#00B3FF; color:white;">
                  <sui-button-content visible>Add Quiz</sui-button-content>
                  <sui-button-content hidden>
                      <sui-icon name="pencil alternate" />
                  </sui-button-content>
              </sui-button>
            </sui-form-field>
            <div v-else class="light-border-shadow" id="quiz-container">
              <div class="float-left" id="quiz-title">Quiz</div>
              <div class="float-left" id="num-questions">
                {{ task.quiz.questions.length }} questions
              </div>
              <div class="float-right">
                <sui-button @click.prevent="deleteQuiz"
                animated size="mini"
                style="background-color:#FF0000; color:white;
                margin-top:0.5rem; margin-left: 0.5rem;">
                  <sui-button-content visible>
                    Delete
                  </sui-button-content>
                  <sui-button-content hidden>
                      <sui-icon name="trash" />
                  </sui-button-content>
                </sui-button>
              </div>
              <div class="divider float-right"></div>
              <div class="float-right">
                <sui-button @click.prevent="editQuiz"
                animated size="mini"
                style="background-color:#00B3FF; color:white;
                margin-top:0.5rem;">
                  <sui-button-content visible>
                    Edit
                  </sui-button-content>
                  <sui-button-content hidden>
                      <sui-icon name="edit outline" />
                  </sui-button-content>
                </sui-button>
              </div>
            </div>
          </div>
        </div>
      </sui-form>
      <AddVideoQuizModal v-if="!is_real_time"
      ref="AddVideoQuizModal" v-on:save-quiz="saveQuiz" />
    </sui-modal-content>
    <sui-modal-actions>
      <div id="action-btns">
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
    </sui-modal-actions>
  </sui-modal>
</template>

<script>
import flatpickr from "flatpickr";
import 'flatpickr/dist/themes/material_blue.css';
import moment from 'moment'
import helpers from '@/helpers.js'
import AddVideoQuizModal from '@/components/AddVideoQuizModal'
import AddQuizForm from '@/components/AddQuizForm'

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
    AddVideoQuizModal,
    AddQuizForm
  },
  data () {
    return {
      show_modal: false,
      task: {
        reminder_time: null,
        video_file: null,
        allow_unrestricted_viewing_for_real_time_submitters: false,
        allow_faster_viewing: false,
        quiz: null
      },
      value: 1,
      header: "",
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
    disableAddQuizBtn() {
      return this.task.video_file == null
    },
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
        this.radio_label_one = "QR Scan"
        this.radio_label_two = "Quiz"
      } else {
        label_prefix = "Async"
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
        this.task.allow_unrestricted_viewing_for_real_time_submitters
          = false
        this.task.allow_faster_viewing = false
      }
    },
    showAddVideoQuizModal() {
      this.$refs.AddVideoQuizModal.showModal(this.task.video_file)
    },
    saveQuiz(questions) {
      this.task.quiz = {
        questions: questions
      }
    },
    deleteQuiz() {
      this.task.quiz = null
    },
    editQuiz() {
      this.$refs.AddVideoQuizModal.showModal(this.task.video_file,
        this.task.quiz.questions)
    }
  }
}
</script>

<style scoped>
#add-task-modal {
  margin-top: 2rem;
}

.add-task-form {
  /*border: black solid;*/
  margin-top:0;
  width: 100%;
}

.add-task-form-field {
  width:70%;
  margin: auto;
  display: inline-block;
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

#quiz-container {
  /*border: black solid;*/
  width: 25rem;
  height: 3rem;
  margin: auto;
  border-radius: 3px;
  padding-left: 1rem;
  padding-right: 1rem;
}

#quiz-title {
  font-weight: bold;
  margin-top: 0.75rem;
  /*border: black solid;*/
}

#num-questions {
  /*border: blue solid;*/
  margin-top: 0.75rem;
  margin-left: 2rem;
  /*margin-left: 3rem;*/
}

.divider {
  border-left: #c7c7c7 solid thin;
  background-color: #c7c7c7;
  height: 90%;
  width: 0.005rem;
  display: inline-block;
  vertical-align: top;
  margin-left: 0.5rem;
  margin-top: 0.15rem;
}

#action-btns {
  margin: auto;
  width: 19rem;
}
</style>