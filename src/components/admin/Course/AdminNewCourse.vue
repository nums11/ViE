<template>
  <div>
    <h2>Create A Course</h2>
    <form @submit.prevent="addCourse">
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label>name:</label>
            <input type="text" class="form-control" v-model="course.name">
          </div>
        </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label>dept:</label>
              <input class="form-control" v-model="course.dept">
            </div>
          </div>
        </div><br />
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label>course_number:</label>
              <input type="number" class="form-control" v-model="course.course_number">
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
        <div class="row section-row">
          <div class="col-md-6">
            <div class="form-group">
              <label>section number:</label>
              <input type="number" class="form-control" v-model="section_number">
              <button @click.prevent="addSection">Add section</button>
            </div>
          </div>
        </div>
        <div class="form-group">
          <button class="btn btn-primary">Create</button>
        </div>
    </form>

  <h3>Sections</h3>
  <p v-for="section_number in section_numbers">{{ section_number }}</p>

  <!-- Showing Instructors -->
  <Instructors v-on:select-instructor="selectInstructor" />

  </div>
</template>

<script>
  import CourseAPI from '@/services/CourseAPI.js';
  import Instructors from '@/components/admin/User/AdminInstructors'

  export default {
    name: 'Course',
    components: {
      Instructors
    },
    data(){
      return {
        course: {},
        instructor: {},
        section_number: null,
        section_numbers: []
      }
    },
    created() {
    },
    methods: {
      async addCourse(evt){
        evt.preventDefault();
        if(typeof this.instructor.first_name !== 'undefined')
          this.course.instructor = this.instructor;
        const response = await CourseAPI.addCourse(this.course, this.section_numbers);
        this.$router.push({name: 'admin_courses'});
      },
      selectInstructor(instructor){
        this.instructor = instructor
      },
      addSection() {
        this.section_numbers.push(this.section_number)
        this.section_number = null
      }
    }
  }
</script>

<style scoped>
.section-row {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>