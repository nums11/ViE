<template>
  <div>
    <h2>Create A Section</h2>
    <form @submit.prevent="addSection">
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label>course:</label>
            <input type="text" class="form-control" v-model="course.name" readonly>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label>instructor:</label>
            <input class="form-control" v-model="instructor.first_name" readonly>
            <input class="form-control" v-model="instructor.last_name" readonly>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label>section_number:</label>
            <input type="number" class="form-control" v-model="section.number">
          </div>
          <div class="form-group">
            <button class="btn btn-primary">Create</button>
          </div>
        </div>
      </div>
    </form>

    <Courses v-on:select-course="selectCourse" />

  </div>
</template>

<script>
  import SectionAPI from '@/services/SectionAPI.js';
  import UserAPI from '@/services/UserAPI.js';
  import CourseAPI from '@/services/CourseAPI.js';
  import Courses from '@/components/admin/Course/AdminCourses'
  import Instructors from '@/components/admin/User/AdminInstructors';
  import AdminSections from '@/components/admin/Section/AdminSections';

  export default {
    name: 'AdminNewSection',
    components: {
      Instructors,
      Courses,
      AdminSections
    },
    data(){
      return {
        section: {},
        course: {},
        instructor: {}
      }
    },
    created() {
    },
    methods: {
      async addSection(evt){
        evt.preventDefault() // prevents the form's default action from redirecting the page
        this.section.instructor = this.instructor
        this.section.course = this.course
        const response = await SectionAPI.addSection(this.section)
        this.$router.push({name: 'admin_sections'})
      },
      selectCourse(course){
        this.course = course
        if(typeof this.course.instructor !== 'undefined' && this.course.instructor !== null)
          this.instructor = this.course.instructor
      }
    }
  }
</script>