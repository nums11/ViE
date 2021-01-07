<template>
  <div id="real-time-portion-form">
    <sui-button @click="$emit('hide-form')"
    content="Cancel" icon="arrow left"
    label-position="left" />
    <sui-form class="form"">
      <div class="form-field">
        <sui-form-field required>
        <label class="form-label">Real-Time Start</label>
          <input v-model="real_time_portion.real_time_start"
          type="datetime-local">
        </sui-form-field>
      </div>
      <div class="form-field">
        <sui-form-field required>
          <label class="form-label">Real-Time End</label>
          <input v-model="real_time_portion.real_time_end"
          type="datetime-local">
        </sui-form-field>
      </div>
      <div id="radio-container">
        <sui-form-fields inline>
          <sui-form-field>
            <sui-checkbox label="QR Scan" radio value="1"
            v-model="value" defaultChecked />
          </sui-form-field>
          <sui-form-field>
            <sui-checkbox label="Quiz" radio value="2"
            v-model="value" />
          </sui-form-field>
        </sui-form-fields>
      </div>
      <div class="form-field">
        <sui-form-field>
          <label class="form-label">Schedule Reminder</label>
          <input v-model="task.reminder_time" type="datetime-local">
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
  name: 'RealTimePortionForm',
  props: {
    real_time_portion: {
      type: Object,
      required: true
    }
  },
  components: {

  },
  data () {
    return {
      // real_time_portion: {
      //   real_time_start: null,
      //   real_time_end: null
      // },
      task: {
        reminder_time: null,
      },
      value: 1
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
#real-time-portion-form {
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