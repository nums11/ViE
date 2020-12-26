<template>
  <div class="dashboard-meeting-card">
    <div class="meeting-name wrap-text">{{ meeting.title }}</div>
    <div class="meeting-course-info">
      <div class="course-info-container wrap-text">{{ course_name }}</div>
      <div class="course-info-container wrap-text">
      {{ course_subject_code }} {{ course_number }}</div>
    </div>
    <div class="divider"></div>
    <div class="view-meeting-btn-container">
      <router-link :to="{name: 'meeting_info', params: {meeting_id: meeting._id}}">
        <sui-button animated size="small"
        style="background-color:#00B3FF; color:white;">
            <sui-button-content visible>View</sui-button-content>
            <sui-button-content hidden>
                <sui-icon name="arrow right" />
            </sui-button-content>
        </sui-button>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardMeetingCard',
  props:{
    meeting: {
      type: Object,
      required: true
    }
  },
  data: function () {
      return {
        course_subject_code: null,
        course_number: null,
        course_name: null
      }
  },
  created () {
    this.assignMeetingCourseValues()
  },
  methods: {
    assignMeetingCourseValues() {
      const meeting_course = this.meeting.sections[0].course
      this.course_subject_code = meeting_course.dept
      this.course_number = meeting_course.course_number
      this.course_name = meeting_course.name
    }
  }
}
</script>

<style scoped>
.dashboard-meeting-card {
  border: #c7c7c7 solid thin;
  box-shadow: 0px 1px 1px #c7c7c7;
  border-radius: 3px;
  margin: auto;
  margin-top: 2rem;
  height: 4rem;
  width: 100%;
}

.meeting-name {
  float: left;
  display: inline-block;
  vertical-align: top;
  height: 100%;
  width: 35%;
  padding-top: 1.2rem;
  font-size: 1.15rem;
  padding-left: 1rem;
  padding-right: 0.5rem;
  text-align: left;
  color: #252b36bf;
  font-weight: bold;
}

.meeting-course-info {
  width: 35%;
  display: inline-block;
  vertical-align: top;
  height: 100%;
  float: left;
}

.course-info-container {
  margin-top: 0.35rem;
  text-align: right;
  width: 100%;
}

.divider {
  border-left: #c7c7c7 solid thin;
  background-color: #c7c7c7;
  height: 90%;
  width: 0.005rem;
  display: inline-block;
  vertical-align: top;
  float: left;
  margin-left: 1rem;
  margin-top: 0.25rem;
}

.view-meeting-btn-container {
  /*border: green solid;*/
  margin-top: 0.75rem;
}

/* Phones */
@media (max-width: 744px) {
  .meeting-name {
    width: 30%;
  }
  .meeting-course-info {
    width: 30%;
  }
}
</style>
