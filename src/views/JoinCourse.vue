<template>
  <div>
    <h2>Input Join Code for course section</h2>
    <form @submit.prevent="joinCourseSection">
       <input v-model="join_code" type="text" />
       <button>Join</button>
    </form>
  </div>
</template>

<script>
import SectionAPI from '@/services/SectionAPI'

export default {
  name: 'JoinCourse',
  data(){
    return {
      join_code: ""
    }
  },
  created() {
    this.current_user = this.$store.state.user.current_user
  },
  methods: {
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
            if(section.has_open_enrollment)
              alert("Section successfully joined")
            else
              alert("Requested to join section. You will be notified when the instructor grants approval")
            this.$router.push({name: 'course_info',
              params: {id: section.course._id}})
          }
        }
      } catch(error) {
        console.log("Error", error)
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