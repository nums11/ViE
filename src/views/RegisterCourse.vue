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
            <label>section number:</label>
            <input type="number" class="form-control" v-model="section_number">
            <button @click.prevent="addSection">Add section</button>
          </div>
        </div>
      </div>
      <h3>Sections</h3>
      <p v-for="section_number in section_numbers">{{ section_number }}</p>
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
        section_numbers: [],
        section_number: null,
      }
    },
    created () {
      this.current_user = this.$store.state.user.current_user
    },
    methods: {
      async registerCourse(){
        this.course.instructor = this.current_user._id
        const response = await CourseAPI.addCourse(this.course, this.section_numbers);
        const new_course = response.data
        console.log("Receied new course", new_course)
        this.$router.push({name: 'course_info',
          params: {id: new_course._id, reload_page: true}});
      },
      addSection() {
        this.section_numbers.push(this.section_number)
        this.section_number = null
      }
    }
}
</script>

<style lang="css" scoped>

</style>