<template>
  <div id="admin-courses">
    <h2>Courses</h2>
    <sui-table>
      <sui-table-header>
        <sui-table-row>
          <sui-table-header-cell>Name</sui-table-header-cell>
          <sui-table-header-cell>Dept</sui-table-header-cell>
          <sui-table-header-cell>Course Number</sui-table-header-cell>
          <sui-table-header-cell>Instructor</sui-table-header-cell>
          <sui-table-header-cell># Sections</sui-table-header-cell>
          <sui-table-header-cell>View Course</sui-table-header-cell>
        </sui-table-row>
      </sui-table-header>
      <sui-table-body>
        <sui-table-row v-for="course in courses">
          <sui-table-cell>{{ course.name }}</sui-table-cell>
          <sui-table-cell>{{ course.dept }}</sui-table-cell>
          <sui-table-cell>{{ course.course_number }}</sui-table-cell>
          <sui-table-cell>
            {{ course.instructor.first_name }} {{ course.instructor.last_name }}
          </sui-table-cell>
          <sui-table-cell>{{ course.sections.length }}</sui-table-cell>
          <sui-table-cell>
            <router-link :to="{name: 'course_info',
            params: {id: course._id}}">
              <sui-button color="blue">View Course</sui-button>
            </router-link>
          </sui-table-cell>
        </sui-table-row>
      </sui-table-body>
    </sui-table>
  </div>
</template>

<script>
  import CourseAPI from '@/services/CourseAPI.js';

  export default {
    name: 'AdminCourses',
    data(){
      return {
        courses: [],
        is_course_view: Boolean
      }
    },
    created() {
      this.getCourses()
      this.setIsCourseView()
    },
    methods: {
      async getCourses () {
        const response = await CourseAPI.getCourses()
        this.courses = response.data
      },
      async deleteCourse(id){
        let confirmation = confirm("Are you sure you want to delete this course?")
        if(confirmation){
          const response = await CourseAPI.deleteCourse(id);
          this.courses.splice(this.courses.findIndex(i => i._id == id), 1)
        }
      },
      setIsCourseView() {
        this.is_course_view = this.$router.currentRoute.name === "admin_courses"
      },
      getFormattedCourseNumber(course_number) {
        let course_number_str = course_number.toString()
        let num_digits = course_number_str.length
        if(num_digits <= 4) {
          return course_number
        } else {
          return course_number_str.slice(0,4) + "/" + course_number_str.slice(4,num_digits)
        }
      }
    }
  }
</script>

<style>
  #admin-courses {
    width: 80%;
    margin: auto;
    margin-top: 2rem;
  }
</style>