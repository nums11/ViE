<template>
  <div>
    <h2>Edit Section</h2>
    <form @submit.prevent="updateSectionNumber">
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label>section_number:</label>
            <input type="number" class="form-control" v-model="section.section_number">
          </div>
          <div class="form-group">
            <button class="btn btn-primary">Update Section Number</button>
          </div>
        </div>
      </div>
    </form>

    <h4>Section Students</h4>
    <table class="table table-hover">
        <thead>
        <tr>
          <th>First Name</th>
          <th>Last Name</th>
          <th>is_instructor</th>
          <th>is_ta</th>
        </tr>
        </thead>
        <tbody>
            <tr v-for="student in students" :key="student._id">
              <td>{{ student.first_name }}</td>
              <td>{{ student.last_name }}</td>
              <td>{{ student.is_instructor }}</td>
              <td>{{ student.is_ta }}</td>
              <td><button class="btn btn-danger" @click.prevent="removeStudent(student)">Remove</button></td>
            </tr>
        </tbody>
    </table>

    <Students v-on:select-student="addStudent" v-bind:is_section_view="true" />

  </div>
</template>

<script>
  import SectionAPI from '@/services/SectionAPI.js';
  import Courses from '@/components/admin/Course/AdminCourses';
  import Instructors from '@/components/admin/User/AdminInstructors';
  import Students from '@/components/admin/User/AdminStudents';

  export default {
    name: 'AdminEditSection',
    components: {
      Courses,
      Instructors,
      Students
    },
    data(){
      return {
        section: {},
        students: []
      }
    },
    created() {
      this.section_id = this.$route.params.id
      this.getSection()
    },
    methods: {
      //TODO: Change to getSection
      async getSection(){
        const response = await SectionAPI.getSection(this.section_id)
        this.section = response.data
        console.log("Section", this.section)
        this.students = this.section.students
      },
      addStudent(student){
        let student_in_section = false
        this.students.forEach(section_student => {
          if(student._id == section_student._id)
            student_in_section = true
        })
        if(!student_in_section)
          this.students.push(student)
      },
      removeStudent(student){
        this.students.splice(this.students.indexOf(student),1)
      },
      async updateSectionNumber() {
        const response = await SectionAPI.updateSectionNumber(this.section_id,
          this.section.section_number)
        this.$router.go()
      }
    }
  }
</script>