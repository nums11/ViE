<template>
  <div class="course-creation">
    <h1>Register Course</h1>
    <form @submit.prevent="registerCourse">
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label>name:</label>
            <input v-model="course.name" type="text" class="form-control"
            placeholder="e.g. Intro to Science">
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label>subject code:</label>
            <input v-model="course.dept" type="text" class="form-control"
            placeholder="e.g. ARTS">
          </div>
        </div>
      </div><br />
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label>course_number:</label>
            <input v-model="course.course_number" type="number" class="form-control"
            placeholder="e.g. 2130">
          </div>
        </div>
      </div>
      <h4>Add sections</h4>
      <div class="row section-row">
        <div class="col-md-6">
          <div class="form-group">
            <div>
              <label for="section-number">section number:</label>
              <input type="number" class="form-control" name="section-number"
              v-model="section.section_number">
            </div>
            <div>
              <label for="open-enrollment">has_open_enrollment</label>
              <input type="checkbox" class="form-control" name="open-enrollment"
              v-model="section.has_open_enrollment">
            </div>
            <button @click.prevent="addSection">Add section</button>
          </div>
        </div>
      </div>
      <h3>Sections</h3>
      <div v-for="section in sections" class="section-container">
        <p>Section Number: {{ section.section_number }}</p>
        <p>has_open_enrollment: {{ section.has_open_enrollment }}</p>
      </div>
      <div class="form-group">
        <button class="btn btn-primary">Create</button>
      </div>
    </form>
  </div>
</template>

<script>
import CourseAPI from '@/services/CourseAPI.js';


export default {
    name: 'RegisterCourse',
    components: {
    },
    data () {
      return {
        course: {},
        sections: [],
        section: {
          has_open_enrollment: false
        },
      }
    },
    created () {
      this.current_user = this.$store.state.user.current_user
    },
    methods: {
      async registerCourse(){
        this.course.instructor = this.current_user._id
        const response = await CourseAPI.addCourse(this.course, this.sections);
        const new_course = response.data
        console.log("Receied new course", new_course)
        this.$router.push({name: 'course_info',
          params: {id: new_course._id, reload_page: true}});
      },
      addSection() {
        this.sections.push(this.section)
        this.section = { has_open_enrollment: false }
        console.log("Sections", this.sections)
      }
    }
}
</script>

<style lang="css" scoped>
.section-container {
  border: black solid;
}
</style>