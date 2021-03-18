<template>
  <div>
    <p id="join-paragraph">Input Join Code for course section</p>
    <sui-form class="form">
       <input v-model="join_code" type="text" placeholder="ABC123" />
       <div id="btn-container" @click="joinCourseSection">
         <Button text="Join" color="blue" 
         size="large" invert_colors :disabled="!formComplete" />
       </div>
    </sui-form>
    <div v-if="user_has_loaded" class="mt-3">
      <h1 v-if="user.pending_approval_sections.length > 0">
        Pending approval
      </h1>
      <p v-for="section in user.pending_approval_sections">
        {{ section.course.name }} ({{ section.course.dept }} 
        {{ section.course.course_number }}) Section 
        {{ section.section_number }}
      </p>
    </div>
  </div>
</template>

<script>
import SectionAPI from '@/services/SectionAPI'
import UserAPI from '@/services/UserAPI'
import EmailAPI from '@/services/EmailAPI'
import Button from '@/components/Button'

export default {
  name: 'JoinCourse',
  components: {
    Button
  },
  data(){
    return {
      join_code: "",
      user: {},
      user_has_loaded: false
    }
  },
  computed: {
    formComplete() {
      return this.join_code !== ''
    }
  },
  created() {
    this.getUser()
  },
  methods: {
    async getUser() {
      const response = await UserAPI.getUser(this.state_user._id)
      this.user = response.data
      this.user_has_loaded = true
    },
    async joinCourseSection() {
      if(this.formComplete) {
        try {
          const response = await SectionAPI.getSectionByJoinCode(this.join_code)
          const section = response.data
          if(this.userIsStudentForCourse(section.course)) {
            window.alert("You are already a student for a section within this course")
          } else if(this.userIsAlreadyPendingAprroval(section)) {
            window.alert("You have already requested to join this section. Please wait"
              + " until you are approved by the instructor")
          } else {
            const confirmation = confirm(`Are you sure you want to join `
              + `${section.course.name} (${section.course.dept} `
              + `${section.course.course_number}) Section ${section.section_number}?`)
            if(confirmation) {
              await SectionAPI.addStudentToSection(section._id, this.user._id,
                section.has_open_enrollment)
              if(section.has_open_enrollment) {
                // this.sendNewStudentEmailToInstructors(section, true)
                window.alert("Section successfully joined")
                this.$router.push({name: 'course_info',
                  params: {id: section.course._id, reload_page: true}})
              } else {
                // this.sendNewStudentEmailToInstructors(section, false)
                window.alert("Requested to join section. You will be notified when the instructor grants approval")
                this.user.pending_approval_sections.push(section)
              }
            }
          }
        } catch(error) {
          console.log("Error", error)
          if(error.response != null && error.response.status === 404)
            window.alert("No Section with this join code found. Please make sure you"
              + " copied the join code correctly.")
          else
            window.alert("Something went wrong. Please try again")
        }
        this.join_code = ""
      }
    },
    userIsStudentForCourse(course) {
      let is_student = false
      for(let i = 0; i < course.sections.length; i++) {
        let section = course.sections[i]
        for (let j = 0; j < section.students.length; j++) {
          let student = section.students[j]
          if(student.user_id === this.user.user_id) {
            is_student = true
            break
          }
        }
        if(is_student)
          break
      }
      return is_student
    },
    userIsAlreadyPendingAprroval(section) {
      let is_pending = false
      let pending_students = section.pending_approval_students
      for(let i = 0; i < pending_students.length; i++) {
        if(pending_students[i].user_id === this.user.user_id) {
          is_pending = true
          break
        }
      }
      return is_pending
    },
    sendNewStudentEmailToInstructors(section, has_open_enrollment) {
      const instructor_emails = []
      section.course.instructors.forEach(instructor => {
        instructor_emails.push(instructor.email)
      })
      const student_name = `${this.state_user.first_name} `
        + `${this.state_user.last_name}`
      const course_name = section.course.name
      const course_subject_code = section.course.dept
      const course_number = section.course.course_number
      const section_number = section.section_number
      instructor_emails.forEach(instructor_email => {
        EmailAPI.sendNewStudentEmailToInstructor(instructor_email,
          student_name, course_name, course_subject_code,
          course_number, section_number, has_open_enrollment)
      })
    }
  },
}
</script>

<style>
#join-paragraph {
  margin: auto;
  margin-top: 2rem;
  font-size: 1.2rem;
}
</style>