<template>
  <div class="course-meeting-card-container">
    <div class="course-meeting-card light-border-shadow">
      <div class="meeting-title wrap-text">{{ meeting.title }}</div>
      <div class="icon-section">
        <sui-icon class="float-right" name="play circle" />
        <sui-icon class="float-right" name="qrcode" />
      </div>
      <div class="divider"></div>
      <div class="view-meeting-btn-container">
        <router-link 
        :to="{name: 'meeting_info', params: {meeting_id: meeting._id}}">
          <sui-button animated size="mini"
          style="background-color:#00B3FF; color:white;">
              <sui-button-content visible>View</sui-button-content>
              <sui-button-content hidden>
                  <sui-icon name="arrow right" />
              </sui-button-content>
          </sui-button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseMeetingCard',
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
    // this.assignMeetingCourseValues()
  },
  methods: {
    // assignMeetingCourseValues() {
    //   const meeting_course = this.meeting.sections[0].course
    //   this.course_subject_code = meeting_course.dept
    //   this.course_number = meeting_course.course_number
    //   this.course_name = meeting_course.name
    // }
  }
}
</script>

<style scoped>
.course-meeting-card-container {
  width: 25rem;
  display: inline-block;
  vertical-align: top;
}

.course-meeting-card {
  border-radius: 3px;
  margin-top: 2rem;
  height: 2.65rem;
  display: inline-block;
  width: 21rem;
  padding-left: 0.35rem;
  padding-right: 0.25rem;
  padding-top: 0.25rem;
}

.meeting-title {
  display: inline-block;
  vertical-align: top;
  margin-top: 0.2rem;
  /*border: orange solid;*/
  width: 10rem;
}

.icon-section {
  display: inline-block;
  /*border: black solid;*/
  margin-top: 0.5rem;
  /*margin-left: 2rem;*/
  width: 4.5rem;
}

.divider {
  border-left: #c7c7c7 solid thin;
  background-color: #c7c7c7;
  height: 90%;
  width: 0.005rem;
  display: inline-block;
  vertical-align: top;
  margin-left: 0.5rem;
}

.view-meeting-btn-container {
  display: inline-block;
  vertical-align: top;
  /*border: red solid;*/
  margin-left: 0.65rem;
}

/*.course-meeting-card:not(:first-child) {
  margin-left: 3rem;
}*/
</style>
