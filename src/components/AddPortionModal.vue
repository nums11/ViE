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
                {{ window_label }}
              </label>
              <input type="datetime-local" :id="time_window_id">
            </sui-form-field>
          </div>
        </div>
        <div class="form-field">
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
      window_label: "",
      start: null,
      end: null,
      time_window_id: ""
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
      let label_prefix = ""
      if(this.is_real_time) {
        label_prefix = "Real-Time"
        this.time_window_text = "Choose the time window"
          + " for the real-time portion of your meeting"
        this.time_window_id = "real_time_window"
      } else {
        label_prefix = "Async"
        this.time_window_text = "Choose the time window"
          + " for which students will be able to submit"
          + " to async tasks"
        this.time_window_id = "async_window"
      }
      this.header = `Add ${label_prefix} Portion`
      this.window_label = `${label_prefix} Window`
    },
    initFlatPickr() {
      // Time Window Input
      const self = this
      self.time_window_picker = flatpickr(`#${this.time_window_id}`, {
        enableTime: true,
        mode: "range",
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
          self.updatePropTimes(selected_dates)
        }
      })
    },
    updatePropTimes(new_times) {
      this.start = new_times[0]
      this.end = new_times[1]
    },
    setVideoFile (e) {
      // todo check if valid file extension
      this.task.video_file = e.target.files[0]
    },
    selectValue(value) {
      this.value = value
    },
    addPortion(){
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
      this.time_window_picker.clear()
      this.show_modal = false
    },
    clearDateTimePicker() {
      this.time_window_picker.clear()
      this.resetInputs()
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