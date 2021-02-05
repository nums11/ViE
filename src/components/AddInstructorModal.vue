<template>
  <sui-modal v-model="show_modal">
    <sui-modal-header class="center-text">
      Add Instructor
    </sui-modal-header>
    <sui-modal-content class="center-text">
      <sui-form @submit.prevent="addInstructor"
      style="margin-top:0;">
        <p>
          Input the user id of the instructor you
          would like to add to your course
        </p>
        <sui-form-field style="width:50%;margin: auto;
        margin-top: 1rem;">
          <label class="form-label">User Id</label>
          <input v-model="instructor_user_id" />
        </sui-form-field>
        <sui-button
          :disabled="disableAddBtn"
          animated size="small"
          style="background-color:#00b80c; color:white;
          margin-top:2rem;">
          <sui-button-content visible>
            Add Instructor
          </sui-button-content>
          <sui-button-content hidden>
            <sui-icon name="plus" />
          </sui-button-content>
        </sui-button>
      </sui-form>
    </sui-modal-content>
    <sui-modal-actions>
      <sui-button @click="cancel">Cancel</sui-button>
    </sui-modal-actions>
  </sui-modal>
</template>

<script>
import UserAPI from '@/services/UserAPI'
import CourseAPI from '@/services/CourseAPI'
import helpers from '@/helpers.js'

export default {
  name: 'AddInstructorModal',
  mixins: [helpers],
  props: {
    course: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      show_modal: false,
      instructor_user_id: "",
      all_instructor_user_ids: [],
      course_instructor_user_ids: []
    }
  },
  computed: {
    disableAddBtn() {
      return this.instructor_user_id.length === 0
    }
  },
  created () {
    this.getCourseInstructorUserIds()
    this.getAllInstructorUserIds()
  },
  methods: {
    getCourseInstructorUserIds() {
      this.course.instructors.forEach(instructor => {
        this.course_instructor_user_ids.push(instructor.user_id)
      })
    },
    async getAllInstructorUserIds() {
      try {
        const response = await UserAPI.getInstructorUserIds()
        this.all_instructor_user_ids = response.data
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong")
      }
    },
    async addInstructor() {
      if(!this.all_instructor_user_ids.includes(
        this.instructor_user_id)) {
        alert("Instructor not found. Please make sure you typed in their"
          + " user id correctly.")
        return
      }
      if(this.course_instructor_user_ids.includes(
        this.instructor_user_id)) {
        alert(`Cannot add instructor with user id '${this.instructor_user_id}'`
          + ` since they are already an instructor for the course.`)
        return
      }
      const confirmation = confirm(`Are you sure you wan to add the user`
        + ` with id ${this.instructor_user_id} as an instructor to your course?`)
      if(!confirmation)
        return

      try {
        const [sections, meeting_ids] =
          this.getCourseSectionsAndMeetingIDs(this.course)
        const response = await CourseAPI.addInstructor(this.course._id,
          this.instructor_user_id, this.state_user.is_rpi_member,
          meeting_ids)
        const added_instructor = response.data
        this.$emit('add-instructor', added_instructor)
        alert("Instructor Added")
        this.cancel()
      } catch(error) {
        console.log(error)
        window.alert("Sorry, something went wrong")
      }
    },
    showModal() {
      this.show_modal = true
    },
    cancel() {
      this.show_modal = false
      this.instructor_user_id = ""
    }
  }
}
</script>

<style scoped>

</style>