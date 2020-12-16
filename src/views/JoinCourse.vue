<template>
  <div>
    <h2>Input Join Code for course section</h2>
    <form @submit.prevent="joinCourseSection">
       <input v-model="join_code" type="text" />
       <button>Join</button>
    </form>
    <div v-if="current_user_has_loaded">
      <h1 v-if="current_user.pending_approval_sections.length > 0">Pending approval</h1>
      <p v-for="section in current_user.pending_approval_sections">
        {{ section.course.name }} ({{ section.course.dept }}) 
        {{ section.course.course_number }} Section {{ section.section_number }}
      </p>
    </div>
  </div>
</template>

<script>
import SectionAPI from '@/services/SectionAPI'
import UserAPI from '@/services/UserAPI'

export default {
  name: 'JoinCourse',
  data(){
    return {
      join_code: "",
      current_user: {},
      current_user_has_loaded: false
    }
  },
  created() {
    this.getCurrentUser()
  },
  methods: {
    async getCurrentUser() {
      const response = await UserAPI.getUser(this.$store.state.user.current_user._id)
      this.current_user = response.data
      this.current_user_has_loaded = true
      console.log("current_user", this.current_user)
    },
    async joinCourseSection() {
      try {
        const response = await SectionAPI.getSectionByJoinCode(this.join_code)
        const section = response.data
        console.log("section", section)
        if(this.userIsStudentForCourse(section.course)) {
          alert("You are already a student for a section within this course")
        } else {
          const confirmation = confirm(`Are you sure you want to join `
            + `${section.course.name} (${section.course.dept} `
            + `${section.course.course_number}) Section ${section.section_number}?`)
          if(confirmation) {
            await SectionAPI.addStudentToSection(section._id, this.current_user._id,
              section.has_open_enrollment)
            if(section.has_open_enrollment) {
              alert("Section successfully joined")
              this.$router.push({name: 'course_info',
                params: {id: section.course._id, reload_page: true}})
            } else {
              alert("Requested to join section. You will be notified when the instructor grants approval")
              this.$router.go()
            }
          }
        }
      } catch(error) {
        console.log("Error", error)
        if(error.response.status === 404)
          alert("No Section with this join code found. Please make sure join"
            + "code is copied correctly.")
        else
          alert("Something went wrong. Please try again")
      }
    },
    userIsStudentForCourse(course) {
      let is_student = false
      for(let i = 0; i < course.sections.length; i++) {
        let section = course.sections[i]
        for (let j = 0; j < section.students.length; j++) {
          let student = section.students[j]
          if(student.user_id === this.current_user.user_id) {
            is_student = true
            break
          }
        }
        if(is_student)
          break
      }
      return is_student
    }
  },
}
</script>

<style lang="css">

</style>