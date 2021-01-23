<template>
  <sui-modal v-model="show_modal">
    <sui-modal-header class="center-text">
      {{ header }}
    </sui-modal-header>
    <sui-modal-content scrolling class="center-text"
    style="padding-top: 0;">
      <sui-form class="form">
        <div>
          <p>{{ time_window_text }}</p>
          <div class="form-field">
            <sui-form-field required>
              <label class="form-label">
                {{ start_label }}
              </label>
              <input type="datetime-local" :id="start_input_id">
            </sui-form-field>
            <div class="mt-2">
              <sui-form-field required>
                <label class="form-label">
                  {{ end_label }}
                </label>
                <input type="datetime-local" :id="end_input_id">
              </sui-form-field>
            </div>
          </div>
        </div>
        <div class="form-field">
          <p v-if="show_error" class="error">Start time must be after end time</p>
          <sui-button @click.prevent="addPortion"
          animated :disabled="!formComplete"
          style="background-color:#00b80c; color:white;">
            <sui-button-content visible>
              Add Portion
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
import flatpickr from "flatpickr";
import 'flatpickr/dist/themes/material_blue.css';
import moment from 'moment'

export default {
  name: 'AddPortionModal',
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
      header: "",
      start_label: "",
      end_label: "",
      start: null,
      end: null,
      start_input_id: "",
      end_input_id: "",
      time_window_text: "",
      show_error: false
    }
  },
  computed: {
    formComplete() {
      return this.start != null &&
        this.end != null
    }
  },
  created () {
    this.setLabelsAndDates()
  },
  mounted() {
    this.initFlatPickr()
  },
  methods: {
    setLabelsAndDates() {
      if(this.is_real_time) {
        this.label_prefix = "Real-Time"
        this.time_window_text = "Choose the time window"
          + " for the real-time portion of your meeting"
      } else {
        this.label_prefix = "Async"
        this.time_window_text = "Choose the time window"
          + " for which students will be able to submit"
          + " to async tasks"
      }
      this.header = `Add ${this.label_prefix} Portion`
      this.start_label = `${this.label_prefix} Start`
      this.end_label = `${this.label_prefix} End`
      this.start_input_id = `${this.label_prefix}-start-input`
      this.end_input_id = `${this.label_prefix}-end-input`
    },
    initFlatPickr() {
      const self = this

      self.start_picker = flatpickr(
        `#${this.start_input_id}`, {
        enableTime: true,
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
          self.updateTime(true, selected_dates)
        }
      })
      self.end_picker = flatpickr(
        `#${this.end_input_id}`, {
        enableTime: true,
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
          self.updateTime(false, selected_dates)

          // self.updatePropTimes(selected_dates)
        }
      })
    },
    updateTime(is_start, time) {
      if(is_start)
        this.start = time[0]
      else
        this.end = time[0]
    },
    setVideoFile (e) {
      // todo check if valid file extension
      this.task.video_file = e.target.files[0]
    },
    selectValue(value) {
      this.value = value
    },
    addPortion(){
      this.show_error = false
      if(!moment(this.end).isAfter(this.start)) {
        this.show_error = true
        return
      }

      let portion;
      if(this.is_real_time) {
        portion = {
          real_time_start: this.start,
          real_time_end: this.end
        }
      } else {
        portion = {
          async_start: this.start,
          async_end: this.end
        }
      }
      this.$emit('add-portion', portion)
      this.hideModal()
    },
    showModal() {
      this.show_modal = true
    },
    hideModal() {
      this.start = null
      this.end = null
      this.show_modal = false
      this.start_picker.clear()
      this.end_picker.clear()
    },
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