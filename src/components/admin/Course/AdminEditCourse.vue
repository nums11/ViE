<template>
  <div>
    <h2>Edit Course</h2>
    <router-link :to="{name: 'course_new_meeting', params: { course_id: course._id }}" tabindex="-1">
      <button class="inline-block"tabindex="0">Create New Meeting for {{ course.dept }} {{ course.course_number }}</button>
    </router-link>
    <form @submit.prevent="updateCourse">
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label>name</label>
            <input type="text" class="form-control" v-model="course.name">
          </div>
        </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label>dept</label>
              <input class="form-control" v-model="course.dept" rows="5">
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label>Number</label>
              <input type="number" class="form-control" v-model="course.course_number" rows="5">
            </div>
          </div>
        </div><br />
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label>instructor</label>
                <input class="form-control" v-model="course.instructor.first_name" rows="5" readonly>
                <input class="form-control" v-model="course.instructor.last_name" rows="5" readonly>
            </div>
          </div>
        </div>
        <div class="form-group">
          <button class="btn btn-primary">Update</button>
        </div>
    </form>

    <!-- Add Section -->
    <h4 style="margin-top: 2rem;">Add Section</h4>
    <form @submit.prevent="addSection">
      <div style="margin: auto;" class="col-md-5">
        <input type="number" placeholder="New Section number" class="form-control" v-model="new_section.number">
      </div>
      <button class="btn btn-primary">Add</button>
    </form>

    <!-- Sections -->
    <h4 style="margin-top: 2rem;">Sections</h4>
    <table style="margin-bottom: 2rem;" class="table table-hover">
        <thead>
        <tr>
          <th>Number</th>
          <th># of students</th>
        </tr>
        </thead>
        <tbody>
            <tr v-for="section in course.sections" :key="section._id">
              <td>{{ section.number }}</td>
              <td>{{ section.students.length }}</td>
              <td><router-link :to="{name: 'admin_edit_section', params: { id: section._id }}" class="btn btn-primary">Edit</router-link></td>
            </tr>
        </tbody>
    </table>

    <!-- Instructors -->
    <Instructors v-on:select-instructor="selectInstructor" />
  </div>
</template>

<script>
  import CourseAPI from '@/services/CourseAPI.js';
  import UserAPI from '@/services/UserAPI.js';
  import Instructors from '@/components/admin/User/AdminInstructors'

  export default {
    name: 'AdminEditCourse',
    components: {
      Instructors
    },
    data() {
      return {
        course: {},
        new_section: {},
      }
    },
    created() {
      this.course_id = this.$route.params.id
      this.getCourse()
    },
    methods: {
      async getCourse() {
        const response = await CourseAPI.getCourse(this.course_id)
        this.course = response.data
        console.log(this.course)
      },
      async addSection () {
        const response = await CourseAPI.addSectionToCourse(this.course_id, this.new_section)
        this.$router.go()
      },
      async updateCourse() {
        const response = await CourseAPI.updateCourse(this.course_id, this.course)
        this.$router.go()
      }, 
      selectInstructor(instructor){
        this.instructor = instructor
        this.course.instructor = instructor
      },
      instructorIsNull(){
        return this.instructor == null
      }
    }
  }
</script>