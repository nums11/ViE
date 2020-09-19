<template>
  <div>
    <h2>Edit Course</h2>
    <router-link :to="{name: 'course_new_meeting', params: { course_id: course._id }}" tabindex="-1">
      <button class="inline-block"tabindex="0">Create New Meeting for {{ course.dept }} {{ course.course_number }}</button>
    </router-link>
    <router-link :to="{name: 'course_info', params: { id: course._id }}" tabindex="-1">
      <button class="inline-block"tabindex="0">Go to Course Info for  {{ course.dept }} {{ course.course_number }}</button>
    </router-link>
    <div class="spinner-border" role="status" v-if="!course_has_loaded">
      <span class="sr-only">Loading...</span>
    </div>
    <form v-else @submit.prevent="updateCourse">
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label>name: </label>
            <input type="text" class="form-control" v-model="course.name">
          </div>
        </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label>dept: </label>
              <input class="form-control" v-model="course.dept" rows="5">
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label>Number: </label>
              <input type="number" class="form-control" v-model="course.course_number" rows="5">
            </div>
          </div>
        </div><br />
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label>instructor: </label>
                <input class="form-control" v-model="course.instructor.first_name" rows="5" readonly>
                <input class="form-control" v-model="course.instructor.last_name" rows="5" readonly>
            </div>
            <div v-if="has_secondary_instructor" class="form-group">
              <label>secondary instructor</label>
<!--               <p>first name: {{ course.secondary_instructor.first_name }}</p>
              <p>first name: {{ course.secondary_instructor.last_name }}</p> -->
              <input class="form-control" v-model="course.secondary_instructor.first_name" rows="5" readonly>
              <input class="form-control" v-model="course.secondary_instructor.last_name" rows="5" readonly>
            </div>
            <p v-else>No secondary instructor</p>
          </div>
        </div>
        <div class="form-group">
          <button class="btn btn-primary">Update</button>
        </div>
    </form>

    <h2>Select Primary Instructor</h2>
    <Instructors v-on:select-instructor="selectInstructor" />
    <h2>Select Secondary Instructor</h2>
    <Instructors v-on:select-instructor="addSecondaryInstructor" />

    <!-- Course Students -->
    <h4 style="margin-top: 2rem;">Course Students</h4>
    <table style="margin-bottom: 2rem;" class="table table-hover">
        <thead>
        <tr>
          <th>First Name</th>
          <th>Last Name</th>
          <th>User ID</th>
        </tr>
        </thead>
        <tbody>
            <tr v-for="student in course.students" :key="student._id">
              <td>{{ student.first_name }}</td>
              <td>{{ student.last_name }}</td>
              <td>{{ student.user_id }}</td>
              <td><button class="btn btn-danger" @click.prevent="removeStudent(student)">Remove</button></td>
            </tr>
        </tbody>
    </table>

    <Students v-on:select-student="addStudent" />

  </div>
</template>

<script>
  import CourseAPI from '@/services/CourseAPI.js';
  import UserAPI from '@/services/UserAPI.js';
  import Instructors from '@/components/admin/User/AdminInstructors'
  import Students from '@/components/admin/User/AdminStudents'

  export default {
    name: 'AdminEditCourse',
    components: {
      Instructors,
      Students
    },
    data() {
      return {
        course: {},
        new_section: {},
        course_has_loaded: false,
        has_secondary_instructor: false
      }
    },
    async created() {
      this.course_id = this.$route.params.id
      await this.getCourse()
      this.has_secondary_instructor = this.course.secondary_instructor != null
    },
    methods: {
      async getCourse() {
        const response = await CourseAPI.getCourse(this.course_id)
        this.course = response.data
        this.course_has_loaded = true
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
      async addSecondaryInstructor(instructor) {
        if(this.course.instructor.user_id === instructor.user_id)
          alert("User is already primary instructor")
        else {
          await CourseAPI.addSecondaryInstructor(this.course_id, instructor._id)
          this.$router.go()
        }
      },
      async addStudent(student) {
        let student_in_course = false
        this.course.students.forEach(course_student => {
          if(student._id == course_student._id)
            student_in_course = true
        })
        if(!student_in_course){
          let confirmation = confirm("Are you sure you want to add this student to the course?")
          if(confirmation){
            const response = await CourseAPI.addStudentToCourse(this.course_id, student._id)
            this.$router.go()
          }
        } else {
          alert("Student already in course")
        }
      },
      async removeStudent(student){
        let confirmation = confirm("Are you sure you want to remove this student from the course?")
        if(confirmation){
          const response = await CourseAPI.removeStudentFromCourse(this.course_id, student._id)
          this.$router.go()
        }
      },
      instructorIsNull(){
        return this.instructor == null
      }
    }
  }
</script>