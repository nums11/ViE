<template>
  <div id="new-meeting">
    <div id="left-section" class="inline-block">
      <div class="floated-right-container">
        <router-link id="back-to-course-btn"
        :to="{name: 'course_info', params: {id: course_id}}">
          <sui-button content="Back to Course" icon="arrow left"
          label-position="left" />
        </router-link>
        <img src="@/assets/logo.svg" id="logo" />
      </div>
      <div class="floated-right-container"
      id="real-time-portion-container">
        <h4>Real-Time Portion</h4>
        <p>12/2, 2p - 12/3, 4p</p>
        <NewMeetingTaskCard />
        <NewMeetingTaskCard />
      </div>
      <div class="floated-right-container" id="async-portion-container">
        <h4>Async Portion</h4>
        <p>No async tasks</p>
      </div>
    </div>

    <div id="right-section" class="inline-block">
      <h1>Schedule Meeting</h1>
      <div id="course-name">RCOS</div>
      <transition name="fade" mode="out-in">
        <sui-form v-if="show_main_form" class="form"">
          <div class="form-field">
            <sui-form-field required>
              <label class="form-label">Title</label>
              <input v-model="meeting.title">
            </sui-form-field>
          </div>
          <div class="mt-3">
            <sui-form-field required>
              <label>Select the sections for your meeting</label>
            </sui-form-field>
          </div>
          <div class="section-selectors mt-1">
            <div class="section-selector">Section 1</div>
            <div class="section-selector">Section 2</div>
          </div>
          <h5 class="mt-3">Add tasks to your meeting</h5>
          <p>Tasks can also be added after your meeting is created</p>
          <sui-button @click.prevent="showRealTimePortionForm"
            animated size="large"
            style="background-color:#00b80c; color:white;
            margin-left:1rem; width:16rem;">
            <sui-button-content visible>
              Add real-time tasks
            </sui-button-content>
            <sui-button-content hidden>
              <sui-icon name="podcast" />
            </sui-button-content>
          </sui-button>
          <sui-button animated size="large"
            style="background-color:#00b80c; color:white;
            margin-left:1rem; margin-top:1rem; width:16rem;">
            <sui-button-content visible>
              Add asynchronous tasks
            </sui-button-content>
            <sui-button-content hidden>
              <sui-icon name="clock" />
            </sui-button-content>
          </sui-button>
          <sui-dropdown selection
          v-model="repeat_selection"
          :options="repeat_options" class="mt-3 ml-1" />
          <div v-if="repeat_selection == 3" class="mt-1 ml-1">
            <sui-dropdown
            multiple selection v-model="repeat_days_selection"
            :options="repeat_days" placeholder="Select days to repeat on"
            />
            <div class="mt-2">
              <sui-form-field>
                <label class="form-label">End Date</label>
                <input v-model="repeat_end_date" type="datetime-local">
              </sui-form-field>
            </div>
          </div>
          <div id="button-container">
            <Button text="Schedule" color="blue" size="large" invert_colors
            wide/>
          </div>
        </sui-form>
        <RealTimePortionForm v-else
        v-on:hide-form="hideRealTimePortionForm"
        v-on:add-task="addTask" />
      </transition>
    </div>
  </div>
</template>

<script>
import Button from '../components/Button';
import NewMeetingTaskCard from '@/components/NewMeetingTaskCard.vue';
import RealTimePortionForm from '@/components/RealTimePortionForm.vue';

export default {
  name: 'NewMeeting',
  components: {
    NewMeetingTaskCard,
    Button,
    RealTimePortionForm
  },
  data () {
    return {
      course_id: "",
      meeting: {},
      show_main_form: true,
      repeat_selection: 0,
      repeat_options: [
        {value: 0, text: "Does not repeat"}, 
        {value: 1, text: "Daily"}, 
        {value: 2, text: "Weekly"},
        {value: 3, text: "Custom Weekly"},
      ],
      repeat_days: [
        {value: 0, text: "Sunday"},
        {value: 1, text: "Monday"},
        {value: 2, text: "Tuesday"},
        {value: 3, text: "Wednesday"},
        {value: 4, text: "Thursday"},
        {value: 5, text: "Friday"},
        {value: 6, text: "Saturday"},
      ],
      repeat_days_selection: [],
      repeat_end_date: null,
    }
  },
  computed: {
  },
  created () {
    this.course_id = this.$route.params.course_id
  },
  methods: {
    showRealTimePortionForm() {
      this.show_main_form = false
    },
    hideRealTimePortionForm() {
      this.show_main_form = true
    },
    addTask() {
      this.hideRealTimePortionForm()
    }
  }
}
</script>

<style scoped>
#new-meeting {
  /*border: black solid;*/
  width: 88%;
  margin: auto;
  margin-top: 3rem;
  padding-bottom: 5rem;
}

.floated-right-container {
  display: inline-block;
  width: 100%;
}

#left-section {
  /*border: blue solid;*/
  width: 30%;
  height: 45rem;
}


#back-to-course-btn {
  /*border: black solid;*/
  margin-left: 2rem;
  margin-top: 1rem;
  display: inline-block;
  /*vertical-align: center;*/
}

#logo {
  height: 5rem;
  /*border: orange solid;*/
  float: right;
}

#real-time-portion-container {
  /*border: black solid;*/
  text-align: right;
  margin-top: 2.5rem;
}

#async-portion-container {
  /*border: red solid;*/
  text-align: right;
}

#right-section {
  /*padding-top: 6rem;*/
  /*border: green solid;*/
  width: 40%;
  text-align: center;
}

#course-name {
  font-size: 1.75rem;
}

.form .mt-3 {
  margin-top: 3rem;
}

.section-selectors {
  /*border: blue solid;*/
/*  width: 32rem;
  margin: auto;
  position: relative;
  margin-top: 3rem;
  margin-bottom: 3rem;*/
}

.section-selector {
  display: inline-block;
  text-align: center;
  margin: auto;
  margin-left: 0.75rem;
  border: #adadad solid thin;
  cursor: pointer;
  border-radius: 3px;
  height: 2rem;
  width: 6rem;
  padding-top: 0.2rem;
}

.selected-section {
  background-color: #47C4FC;
  border: #47C4FC solid;
  color: white;
}

#button-container {
  margin-top: 3rem;
  margin-left: 1rem;
}
</style>