<template>
  <div id="course-settings">
    <div id="section-header">Settings</div>
    <h3>Course Details</h3>
    <sui-form id="course-settings-form">
      <sui-form-fields fields="three">
        <sui-form-field>
          <label>Name</label>
          <input type="text" v-model="temp_course.name" />
        </sui-form-field>
        <sui-form-field>
          <label>Subject Code</label>
          <input type="text" v-model="temp_course.dept" />
        </sui-form-field>
        <sui-form-field>
          <label>Course Number</label>
          <input type="number" min="0"
          v-model="temp_course.course_number"
          onkeypress="return event.charCode >= 48 &&
            event.charCode <= 57" />
        </sui-form-field>
      </sui-form-fields>
    </sui-form>
    <h3 class="mt-2">Sections</h3>
    <sui-button @click="showModal" size="small"
    style="background-color:#00b80c; color:white;" animated>
      <sui-button-content visible>Add Section</sui-button-content>
      <sui-button-content hidden>
          <sui-icon name="plus" />
      </sui-button-content>
    </sui-button>
    <AddSectionModal
    ref="AddSectionModal" :course="course"
    v-on:add-section="addSection" />
    <div v-for="section in temp_course.sections"
    class="mt-2">
      Section <sui-input type="number" min="0"
      onkeypress="return event.charCode >= 48 && event.charCode <= 57"
      v-model="section.section_number"
      class="section-number-input" />
      <p class="enrollment-status">
        {{ section.has_open_enrollment ?
        "Open Enrollment" : "Closed Enrollment" }}
      </p>
      <sui-checkbox v-model="section.has_open_enrollment"
      class="enrollment-checkbox" />
      <sui-button @click="deleteSection(section)" size="small" animated
      style="background-color:#FF0000; 
      color:white;margin-left:2rem;">
        <sui-button-content visible>Delete Section</sui-button-content>
        <sui-button-content hidden>
            <sui-icon name="trash" />
        </sui-button-content>
      </sui-button>
    </div>
    <div class="course-action-btns-container">
      <sui-button @click="updateCourse"
        animated size="small"
        style="background-color:#00B3FF; color:white;">
        <sui-button-content visible>
          Update Course
        </sui-button-content>
        <sui-button-content hidden>
          <sui-icon name="sync" />
        </sui-button-content>
      </sui-button>
      <sui-button
        animated size="small"
        style="background-color:#FF0000; color:white;">
        <sui-button-content visible>
          Delete Course
        </sui-button-content>
        <sui-button-content hidden>
          <sui-icon name="trash" />
        </sui-button-content>
      </sui-button>
    </div>
  </div>
</template>

<script>
import CourseAPI from '@/services/CourseAPI'
import SectionAPI from '@/services/SectionAPI'
import AddSectionModal from
'@/components/AddSectionModal'
import helpers from '@/helpers.js'

export default {
  name: 'CourseSettings',
  mixins: [helpers],
  components: {
    AddSectionModal
  },
  props: {
    course: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      temp_course: null,
    }
  },
  created () {
    this.setTempVariables()
  },
  mounted () {
  },
  methods: {
    setTempVariables() {
      this.temp_course = {
        name: this.course.name,
        dept: this.course.dept,
        course_number: this.course.course_number,
        sections: []
      }
      this.course.sections.forEach(section => {
        this.temp_course.sections.push({
          section_number: section.section_number,
          has_open_enrollment: section.has_open_enrollment,
          _id: section._id
        })
      })
    },
    async updateCourse() {
      if(this.sectionsHaveDuplicateNumbers()) {
        alert("Cannot have 2 or more sections with the same"
          + " section number")
        return
      }

      try {
        await CourseAPI.updateCourse(this.course._id,
          this.temp_course)
        this.updateCourseAndSectionValues()
        alert("Course Updated")
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong")
      }
    },
    updateCourseAndSectionValues() {
      this.course.name = this.temp_course.name
      this.course.dept = this.temp_course.dept
      this.course.course_number = this.temp_course.course_number
      for(let i = 0; i < this.course.sections.length; i++) {
        this.course.sections[i].section_number =
          this.temp_course.sections[i].section_number
        this.course.sections[i].has_open_enrollment =
          this.temp_course.sections[i].has_open_enrollment
      }
      this.course.sections.sort(this.sectionCompare)
      this.temp_course.sections.sort(this.sectionCompare)
    },
    addSection(section) {
      this.course.sections.push(section)
      this.temp_course.sections.push(section)
    },
    showModal() {
      this.$refs.AddSectionModal.showModal()
    },
    sectionsHaveDuplicateNumbers() {
      let section_numbers = new Set()
      let has_duplicate = false
      const sections = this.temp_course.sections
      for(let i = 0; i < sections.length; i++) {
        const number = sections[i].section_number
        if(section_numbers.has(number)) {
          has_duplicate = true
          break
        } else {
          section_numbers.add(number)
        }
      }
      return has_duplicate
    },
    async deleteSection(temp_section) {
      const confirmation = confirm("Are you sure you want to"
        + " permanently delete this section?")
      if(!confirmation)
        return

      try {
        const index = this.getSectionIndex(temp_section)
        const section = this.course.sections[index]
        const [meeting_ids, student_ids,
        pending_approval_student_ids]
          = this.getStudentIDsAndMeetingIDS(section)
        await SectionAPI.deleteSection(section._id, meeting_ids,
          student_ids, pending_approval_student_ids,
          this.course.instructor._id, this.course._id)
        console.log("Section deleted")
        this.removeSectionFromCourse(index)
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong")
      }
    },
    getStudentIDsAndMeetingIDS(section) {
      let meeting_ids = []
      let student_ids = []
      let pending_approval_student_ids = []
      section.meetings.forEach(meeting => {
        meeting_ids.push(meeting._id)
      })
      section.students.forEach(student => {
        student_ids.push(student._id)
      })
      section.pending_approval_students.forEach(student => {
        pending_approval_student_ids.push(student._id)
      })
      return [meeting_ids, student_ids, pending_approval_student_ids]
    },
    getSectionIndex(section) {
      let index = -1
      let sections = this.course.sections
      for(let i = 0; i < sections.length; i++) {
        if(sections[i]._id === section._id){
          index = i
          break
        }
      }
      return index
    },
    removeSectionFromCourse(index) {
      this.course.sections.splice(index, 1)
      this.temp_course.sections.splice(index, 1)
    }
  }
}
</script>

<style scoped>
#section-header {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

#course-settings-form {
  width: 100%;
  margin-top: 0;
}

.section-number-input {
  width: 5rem;
  margin-left: 0.5rem;
}

.enrollment-status {
  display: inline-block;
  margin-left: 1rem;
  width: 9rem;
}

.enrollment-checkbox {
  margin-left: 1rem;
  margin-top: 1rem;
  padding-top: 0.25rem;
}

.course-action-btns-container {
  width: 19rem;
  margin: auto;
  margin-top: 4rem;
}
</style>