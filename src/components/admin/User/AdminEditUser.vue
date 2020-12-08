<template>
  <div>
    <div class="spinner-border" role="status" v-if="!user_has_loaded">
      <span class="sr-only">Loading...</span>
    </div>

    <form v-else @submit.prevent="updateUser">
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label>First Name</label>
            <input type="text" class="form-control" v-model="user.first_name">
          </div>
        </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label>Last Name</label>
              <input class="form-control" v-model="user.last_name" rows="5">
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label>User ID</label>
              <input type="text" class="form-control" v-model="user.user_id" rows="5">
            </div>
          </div>
        </div><br />
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label>is_instructor</label>
                <input type="checkbox" class="form-control" v-model="user.is_instructor" rows="5">
            </div>
          </div>
        </div>
        <div class="form-group">
          <button class="btn btn-primary">Update</button>
        </div>
    </form>

    <div class="container" v-if="user_has_loaded">
      <h3 style="text-decoration:underline; margin-top:2rem; font-weight:bold;">Instructor Courses</h3>
      <h4 v-for="course in user.instructor_courses">{{ course.name }}</h4>
      <h3 style="text-decoration:underline; margin-top:2rem; font-weight:bold;">Student Sections</h3>
      <h4 v-for="section in user.student_sections">{{ section.section_number }}</h4>
      <h3 style="text-decoration:underline; margin-top:2rem; font-weight:bold;">User Orgs</h3>
      <h4 v-for="org in user.user_orgs">{{ org.name }}</h4>
      <h3 style="text-decoration:underline; margin-top:2rem; font-weight:bold;">Meetings</h3>
      <h4 v-for="meeting in user.meetings">{{ meeting.title }}</h4>
      <h3 style="text-decoration:underline; margin-top:2rem; font-weight:bold;">Live Submissions</h3>
      <h4 v-for="submission in user.live_submissions">{{ new Date(submission.live_submission_time) }}</h4>
      <h3 style="text-decoration:underline; margin-top:2rem; font-weight:bold;">Async Submisions</h3>
      <h4 v-for="submission in user.async_submissions">Async sub</h4>
      <h3 style="text-decoration:underline; margin-top:2rem; font-weight:bold;">Service Worker Subscriptions 
      ({{user.service_worker_subscriptions.length}})</h3>
      <h4 v-for="subscription in user.service_worker_subscriptions">{{ subscription.endpoint }}</h4>
    </div>
  </div>
</template>

<script>
import UserAPI from "@/services/UserAPI.js";
import SectionAPI from "@/services/SectionAPI.js";
import Courses from "@/components/admin/Course/AdminCourses";

export default {
  name: "AdminEditUser",
  components: {
    Courses
  },
  data() {
    return {
      user: {},
      user_has_loaded: false
    };
  },
  created() {
    this.getCurrentUser();
  },
  methods: {
    async getCurrentUser() {
      let user_id = this.$route.params.id;
      const response = await UserAPI.getUser(user_id);
      this.user = response.data;
      this.user_has_loaded = true
    },
    async getSections() {
      let user_id = this.$route.params.id;
      const response = await UserAPI.getStudentSections(user_id);
      this.sections = response.data;
      this.getInstructorForSections();
      this.getCourseForSections();
    },
    async getInstructorForSections() {
      let counter = 0;
      this.sections.forEach(async section => {
        const response = await SectionAPI.getInstructor(section._id);
        section.instructor = response.data;
        counter++;
        if (counter == this.sections.length)
          this.section_instructors_have_loaded = true;
      });
    },
    async getCourseForSections() {
      let counter = 0;
      this.sections.forEach(async section => {
        const response = await SectionAPI.getCourse(section._id);
        section.course = response.data;
        counter++;
        if (counter == this.sections.length)
          this.section_courses_have_loaded = true;
      });
    },
    async updateUser() {
      let confirmation = confirm("Are you sure you want to update this user?")
      if(confirmation){
        let user_id = this.$route.params.id;
        const response = await UserAPI.updateUser(user_id, this.user);
        this.$router.push({ name: "admin_users" });
      }
    },
    async getInstructorCourses() {
      let user_id = this.$route.params.id;
      const response = await UserAPI.getInstructorCourses(user_id);
      this.instructor_courses = response.data;
    }
  }
};
</script>

<style scoped>
  
h4 {
  font-weight: normal;
}

</style>