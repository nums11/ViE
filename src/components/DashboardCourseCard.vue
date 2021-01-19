<template>
  <div :class="'dashboard-course-card light-border-shadow ' +
  (is_instructor ? '' : 'student-card')">
    <div class="card-section" :id="is_instructor ? 'left' : 'left-large'">
      <div class="wrap-text" id="course-name">{{ course.name }}</div>
      <div class="wrap-text" id="course-info">
        {{ course.dept }} {{ course.course_number }}
      </div>
    </div>
    <div class="card-section" :id="is_instructor ? 'right' : 'right-small'">
      <div class="course-card-btn-container">
        <router-link :to="{name: 'course_info', params: {id: course._id}}">
          <show-at breakpoint="mediumAndAbove">
            <sui-button animated size="small"
            style="background-color:#00B3FF; color:white;">
              <sui-button-content visible>View</sui-button-content>
              <sui-button-content hidden>
                <sui-icon name="arrow right" />
              </sui-button-content>
            </sui-button>
          </show-at>
          <hide-at breakpoint="mediumAndAbove">
            <sui-button animated size="tiny"
            style="background-color:#00B3FF; color:white;">
              <sui-button-content visible>View</sui-button-content>
              <sui-button-content hidden>
                <sui-icon name="arrow right" />
              </sui-button-content>
            </sui-button>
          </hide-at>
        </router-link>
      </div>
      <div class="divider" v-if="is_instructor"></div>
      <div class="course-card-btn-container"
      id="schedule-meeting-container" v-if="is_instructor">
        <router-link :to="{name: 'course_new_meeting',
        params: {course_id: course._id}}">
          <show-at breakpoint="mediumAndAbove">
            <sui-button animated size="small"
              style="background-color:#00b80c; color: white;">
                <sui-button-content visible>
                  Schedule Meeting
                </sui-button-content>
                <sui-button-content hidden>
                  <sui-icon name="calendar plus" />
                </sui-button-content>
            </sui-button>
          </show-at>
          <hide-at breakpoint="mediumAndAbove">
            <sui-button animated size="tiny"
              style="background-color:#00b80c; color: white;">
                <sui-button-content visible>
                  Schedule Meeting
                </sui-button-content>
                <sui-button-content hidden>
                  <sui-icon name="calendar plus" />
                </sui-button-content>
            </sui-button>
          </hide-at>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardCourseCard',
  props:{
    course: {
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
  },
  methods: {
  }
}
</script>

<style scoped>
.dashboard-course-card {
  border-radius: 3px;
  height: 4rem;
  width: 32.5rem;
  display: inline-block;
  vertical-align: top;
}

.student-card {
  width: 20rem;
}

.dashboard-course-card:not(:first-child) {
  margin-left: 2rem;
}

.card-section {
  height: 100%;
  display: inline-block;
  vertical-align: top;
  padding-top: 0.5rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

#left {
  width: 40%;
}

#left-large {
  width: 70%;
}

#right {
  width: 60%;
}

#right-small {
  border: 30%;
}

#course-name {
  color: #252b36bf;
  font-weight: bold;
  font-size: 1.15rem;
}

.course-card-btn-container {
  /*border: red solid;*/
  display: inline-block;
  vertical-align: top;
  margin-top: 0.3rem;
}

#schedule-meeting-container {
  margin-left: 1rem;
}

.meeting-name {
  float: left;
  display: inline-block;
  vertical-align: top;
  height: 100%;
  width: 35%;
  padding-top: 1.2rem;
  font-size: 1.15rem;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
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
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
}

.divider {
  border-left: #c7c7c7 solid thin;
  background-color: #c7c7c7;
  height: 90%;
  width: 0.005rem;
  display: inline-block;
  vertical-align: top;
  /*float: left;*/
  margin-left: 1rem;
  /*margin-top: 0.25rem;*/
}

/* Phones */
@media (max-width: 744px) {
  .dashboard-course-card {
    width: 100%;
    display: block;
  }
  .dashboard-course-card:not(:first-child) {
    margin-top: 2rem;
    margin-left: 0;
  }
  #left {
    width: 30%;
    padding-top: 0.75rem;
  }
  #right {
    width: 70%;
  }
  #course-name {
    font-size: 1.05rem;
  }
  #course-info {
    font-size: 0.85rem;
  }
  .divider {
    margin-left: 0.15rem;
  }
  #schedule-meeting-container {
    margin-left: 0.35rem;
  }
}
</style>
