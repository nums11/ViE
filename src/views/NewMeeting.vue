<template>
  <div id="new-meeting">
<!--     <router-link
    :to="{name: 'course_info', params: {id: course_id}}">
      <sui-button content="Back to Course" icon="arrow left"
      label-position="left" />
    </router-link>
    <div id="form-header-container">
      <h1>Schedule Meeting</h1>
    </div> -->
    <div id="left-section" class="inline-block">
      <div class="float-right">
        <router-link class="float-right"
        :to="{name: 'course_info', params: {id: course_id}}">
          <sui-button content="Back to Course" icon="arrow left"
          label-position="left" />
        </router-link>
        <div>
          <img src="@/assets/logo.svg" id="logo" />
        </div>
        <div id="meeting-tasks-container">
          <div style="border: blue solid">
           <h4>Real-Time Portion</h4>
           <p>12/2, 2p - 12/3, 4p</p>
           <NewMeetingTaskCard />
         <NewMeetingTaskCard />
         </div>
         <div style="border: red solid;">
           <h4>Async Portion</h4>
           <p>No async tasks</p>
         </div>

       </div>
      </div>
    </div>
    <div id="right-section" class="inline-block">
      <h1>Schedule Meeting</h1>
      <div id="course-name">RCOS</div>
      <sui-form class="form">
        <div class="form-field">
          <sui-form-field>
            <label class="form-label">Title</label>
            <input v-model="meeting.title">
          </sui-form-field>
        </div>
        <h5 class="mt-3">Select the sections for your meeting</h5>
        <div class="section-selectors">
          <div class="section-selector">Section 1</div>
          <div class="section-selector">Section 2</div>
        </div>
        <h5 class="mt-3">Add tasks to your meeting</h5>
        <p>Tasks can also be added after your meeting is created</p>
        <sui-button animated size="large"
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
        <div id="button-container">
          <Button text="Schedule" color="blue" size="large" invert_colors
          wide/>
        </div>
      </sui-form>

    </div>
  </div>
</template>

<script>
import Button from '../components/Button';
import NewMeetingTaskCard from '@/components/NewMeetingTaskCard.vue';

export default {
  name: 'NewMeeting',
  components: {
    NewMeetingTaskCard,
    Button
  },
  data () {
    return {
      course_id: "",
      meeting: {}
    }
  },
  computed: {
  },
  created () {
    this.course_id = this.$route.params.course_id
  },
  methods: {

  }
}
</script>

<style scoped>
#new-meeting {
  border: black solid;
  width: 88%;
  margin: auto;
  margin-top: 3rem;
}

#left-section {
  border: blue solid;
  width: 31%;
  height: 45rem;
}

#logo {
  height: 5rem;
  margin-top: 3rem;
  border: orange solid;
  margin-right: 0;
  margin-left: 4rem;
  float: right;
}

#meeting-tasks-container {
  margin-top: 14rem;
  border: blue solid;
  text-align: right;
  height: 30rem;
}

#right-section {
  padding-top: 6rem;
  border: green solid;
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