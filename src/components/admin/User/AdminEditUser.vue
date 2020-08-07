<template>
  <div>
    <h3>First Name: {{user.first_name}}</h3>
    <h3>Last Name: {{user.last_name}}</h3>
    <h3>User ID: {{user.user_id}}</h3>
    <h3>Instructor Courses</h3>
    <p v-for="course in user.instructor_courses">
      {{ course.name }}
    </p>

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