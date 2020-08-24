<template>
  <div>
<!--     <h3>First Name: {{user.first_name}}</h3>
    <h3>Last Name: {{user.last_name}}</h3>
    <h3>User ID: {{user.user_id}}</h3>
    <h3>Instructor Courses</h3>
    <p v-for="course in user.instructor_courses">
      {{ course.name }}
    </p>
 -->
    <div class="container">
      <div class="row">
        <div class="col-md">
          <h3 style="font-weight: bold">First Name:</h3>
          <h3 style="font-weight: bold">Last Name:</h3>
          <h3 style="font-weight: bold">User ID:</h3>
          <h3 style="font-weight: bold">Email:</h3>
          <h3 style="font-weight: bold">is_instructor:</h3>
          <h3 style="font-weight: bold">is_admin:</h3>
<!--           <h3 style="font-weight: bold">Instructor Courses:</h3>
          <h3 style="font-weight: bold">Student Courses:</h3>
          <h3 style="font-weight: bold">User Orgs:</h3>
          <h3 style="font-weight: bold">Meetings:</h3>
          <h3 style="font-weight: bold">Live Submissions:</h3>
          <h3 style="font-weight: bold">Async Submissions:</h3> -->

        </div>
        <div class="col-md">
          <h3>{{ user.first_name }}</h3>
          <h3>{{ user.last_name }}</h3>
          <h3>{{ user.user_id }}</h3>
          <h3>{{ user.email }}</h3>
          <h3>{{ user.is_instructor }}</h3>
          <h3>{{ user.is_admin }}</h3>
<!--           <h3 v-for="course in user.instructor_courses">{{ course.name }}</h3> -->
        </div>
      </div>
    </div>
    <div class="container">
      <h3 style="text-decoration:underline; margin-top:2rem; font-weight:bold;">Instructor Courses</h3>
      <h4 v-for="course in user.instructor_courses">{{ course.name }}</h4>
      <h3 style="text-decoration:underline; margin-top:2rem; font-weight:bold;">Student Courses</h3>
      <h4 v-for="course in user.student_courses">{{ course.name }}</h4>
      <h3 style="text-decoration:underline; margin-top:2rem; font-weight:bold;">User Orgs</h3>
      <h4 v-for="org in user.user_orgs">{{ org.name }}</h4>
      <h3 style="text-decoration:underline; margin-top:2rem; font-weight:bold;">Meetings</h3>
      <h4 v-for="meeting in user.meetings">{{ meeting.title }}</h4>
      <h3 style="text-decoration:underline; margin-top:2rem; font-weight:bold;">Live Submissions</h3>
      <h4 v-for="submission in user.live_submissions">{{ new Date(submission.live_submission_time) }}</h4>
      <h3 style="text-decoration:underline; margin-top:2rem; font-weight:bold;">Async Submisions</h3>
      <h4 v-for="submission in user.async_submissions">Async sub</h4>
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
      instructor_courses: [],
      sections: [],
      section_instructors_have_loaded: false,
      section_courses_have_loaded: false
    };
  },
  created() {
    this.getCurrentUser();
    // this.getInstructorCourses();
  },
  methods: {
    async getCurrentUser() {
      let user_id = this.$route.params.id;
      const response = await UserAPI.getUser(user_id);
      this.user = response.data;
      console.log(this.user)
      // if (!this.user.is_instructor) this.getSections();
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
      let user_id = this.$route.params.id;
      const response = await UserAPI.updateUser(user_id, this.user);
      this.$router.push({ name: "users" });
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
  
</style>