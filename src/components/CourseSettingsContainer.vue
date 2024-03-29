<template>
  <div id="course-settings">
    <div id="section-header">Settings</div>
    <h3>Course Details</h3>
    <sui-form id="course-settings-form">
      <sui-form-fields fields="three">
        <sui-form-field>
          <label>Name</label>
          <input type="text" v-model="course_copy.name" />
        </sui-form-field>
        <sui-form-field>
          <label>Subject Code</label>
          <input type="text" v-model="course_copy.dept" />
        </sui-form-field>
        <sui-form-field>
          <label>Course Number</label>
          <input type="number" min="0"
          v-model="course_copy.course_number"
          onkeypress="return event.charCode >= 48 &&
            event.charCode <= 57" />
        </sui-form-field>
      </sui-form-fields>
    </sui-form>
    <h3>Instructors</h3>
    <sui-button @click="showAddInstructorModal" size="tiny"
    style="background-color:#00b80c; color:white;" animated>
      <sui-button-content visible>Add Instructor</sui-button-content>
      <sui-button-content hidden>
          <sui-icon name="plus" />
      </sui-button-content>
    </sui-button>
    <div v-for="(instructor,index) in course.instructors"
    class="mt-2">
      {{ instructor.first_name }} {{ instructor.last_name }}
      <sui-button @click="removeInstructor(index)" size="small" animated
      style="background-color:#FF0000; 
      color:white;margin-left:2rem;" :disabled="courseHas1Instructor">
        <sui-button-content visible>Remove Instructor</sui-button-content>
        <sui-button-content hidden>
            <sui-icon name="trash" />
        </sui-button-content>
      </sui-button>
    </div>
    <AddInstructorModal ref="AddInstructorModal"
    :course="course"
    v-on:add-instructor="addInstructor" />

    <h3 class="mt-2">Sections</h3>
    <sui-button @click="showAddSectionModal" size="small"
    style="background-color:#00b80c; color:white;" animated>
      <sui-button-content visible>Add Section</sui-button-content>
      <sui-button-content hidden>
          <sui-icon name="plus" />
      </sui-button-content>
    </sui-button>
    <AddSectionModal
    ref="AddSectionModal" :course="course"
    v-on:add-section="addSection" />
    <div v-for="(section,index) in course_copy.sections"
    class="mt-2">
      Section <sui-input type="number" min="0"
      onkeypress="return event.charCode >= 48 && event.charCode <= 57"
      v-model="section.section_number"
      class="section-number-input" />
      <sui-dropdown selection
      class="ml-2"
      placeholder="Enrollment Status"
      :options="options"
      v-model="selected_options[index]" />
      <sui-button @click="deleteSection(section)" size="small" animated
      style="background-color:#FF0000; 
      color:white;margin-left:2rem;" :disabled="courseHas1Section">
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
      <sui-button @click="deleteCourse"
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
import AddInstructorModal from
'@/components/AddInstructorModal'
import helpers from '@/helpers.js'

export default {
  name: 'CourseSettings',
  mixins: [helpers],
  components: {
    AddSectionModal,
    AddInstructorModal
  },
  props: {
    course: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      course_copy: null,
      options: [
        {
          text: "Open Enrollment",
          value: 1
        },
        {
          text: "Closed Enrollment",
          value: 2
        }
      ],
      selected_options: []
    }
  },
  computed: {
    courseHas1Section() {
      return this.course_copy.sections.length
        === 1
    },
    courseHas1Instructor() {
      return this.course.instructors.length === 1
    }
  },
  created () {
    this.setCopyVariables()
  },
  mounted () {
  },
  methods: {
    setCopyVariables() {
      this.course_copy = {
        name: this.course.name,
        dept: this.course.dept,
        course_number: this.course.course_number,
        sections: []
      }
      this.course.sections.forEach(section => {
        this.course_copy.sections.push({
          section_number: section.section_number,
          has_open_enrollment: section.has_open_enrollment,
          _id: section._id
        })
        if(section.has_open_enrollment)
          this.selected_options.push(1)
        else
          this.selected_options.push(2)
      })
    },
    async updateCourse() {
      if(this.sectionsHaveDuplicateNumbers()) {
        window.alert("Cannot have 2 or more sections with the same"
          + " section number")
        return
      }

      try {
        this.updateSectionEnrollmentStatuses()
        await CourseAPI.updateCourse(this.course._id,
          this.course_copy)
        this.updateCourseAndSectionValues()
        window.alert("Course Updated")
      } catch(error) {
        console.log(error)
        window.alert("Sorry, something went wrong")
      }
    },
    updateSectionEnrollmentStatuses() {
      for(let i = 0; i < this.course_copy.sections.length;
        i++) {
        const enrollment_value = this.selected_options[i]
        if(enrollment_value === 1)
          this.course_copy.sections[i].has_open_enrollment = true
        else
          this.course_copy.sections[i].has_open_enrollment = false
      }
    },
    updateCourseAndSectionValues() {
      this.course.name = this.course_copy.name
      this.course.dept = this.course_copy.dept
      this.course.course_number = this.course_copy.course_number
      for(let i = 0; i < this.course.sections.length; i++) {
        this.course.sections[i].section_number =
          this.course_copy.sections[i].section_number
        this.course.sections[i].has_open_enrollment =
          this.course_copy.sections[i].has_open_enrollment
      }
      this.course.sections.sort(this.sectionCompare)
      this.course_copy.sections.sort(this.sectionCompare)
    },
    addSection(section) {
      this.course.sections.push(section)
      this.course_copy.sections.push(section)
    },
    addInstructor(instructor) {
      this.course.instructors.push(instructor)
    },
    showAddInstructorModal() {
      this.$refs.AddInstructorModal.showModal()
    },
    showAddSectionModal() {
      this.$refs.AddSectionModal.showModal()
    },
    sectionsHaveDuplicateNumbers() {
      let section_numbers = new Set()
      let has_duplicate = false
      const sections = this.course_copy.sections
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
          this.getObjectIdsFromObjects(this.course.instructors),
          this.course._id)
        this.removeSectionFromCourse(index)
      } catch(error) {
        console.log(error)
        window.alert("Sorry, something went wrong")
      }
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
      this.course_copy.sections.splice(index, 1)
    },
    async deleteCourse() {
      let confirmation = confirm("Are you sure you want to"
        + " permanently delete this course?")
      if(!confirmation)
        return

      try {
        const [sections, meeting_ids] =
          this.getCourseSectionsAndMeetingIDs(this.course)
        await CourseAPI.deleteCourse(this.course._id,
          sections, meeting_ids,
          this.getObjectIdsFromObjects(this.course.instructors))
        this.$router.push({name: 'dashboard', params:
          {reload_page: true}});
      } catch(error) {
        console.log(error)
        window.alert("Sorry, something went wrong")
      }
    },
    async removeInstructor(index) {
      const instructor = this.course.instructors[index]
      const confirmation = confirm(`Are you sure you want to remove`
        + ` ${instructor.first_name} ${instructor.last_name} as an`
        + ` instructor for your course?`)
      if(!confirmation)
        return

      try {
        const [sections, meeting_ids] =
          this.getCourseSectionsAndMeetingIDs(this.course)
        const response = await CourseAPI.removeInstructor(this.course._id,
          instructor._id, meeting_ids)
        this.course.instructors.splice(index,1)
        this.$refs.AddInstructorModal.removeInstructor(index)
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong")
      }
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
  width: 8rem;
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