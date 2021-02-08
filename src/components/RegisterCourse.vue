<template>
  <sui-form class="form">
    <div class="form-field">
      <sui-form-field required :error="showNameInputError">
        <label class="form-label">Name</label>
        <sui-popup content="Course Name - e.g. Intro to ViE"
          position="top center" inverted>
          <input v-model="course.name" @blur="setNameInputClicked"
          slot="trigger">
        </sui-popup>
      </sui-form-field>
    </div>
    <div class="form-field">
      <sui-form-field required :error="showSubjectCodeInputError">
        <label class="form-label">Subject Code</label>
        <sui-popup content="Subject Code - e.g. VIE"
          position="top center" inverted>
          <input v-model="course.dept" @blur="setSubjectCodeInputClicked"
          slot="trigger">
        </sui-popup>
      </sui-form-field>
    </div>
    <div class="form-field">
      <sui-form-field required :error="showCourseNumberInputError">
        <label class="form-label">Course Number</label>
        <sui-popup content="Course Number - e.g. 4200"
          position="top center" inverted>
          <input v-model="course.course_number" @blur="setCourseNumberInputClicked"
          type="number" slot="trigger" min="0"
          onkeypress="return event.charCode >= 48 && event.charCode <= 57">
        </sui-popup>
      </sui-form-field>
    </div>
    <div class="form-field">
      <h3>Add Sections</h3>
      <p>
        At least 1 section is required to register a course.
      </p>
      <p>
        Additional sections can be added after a course is registered.
      </p>
      <sui-button @click.prevent="showModal" size="small"
      style="background-color:#00b80c; color:white;" animated>
        <sui-button-content visible>Add Section</sui-button-content>
        <sui-button-content hidden>
            <sui-icon name="plus" />
        </sui-button-content>
      </sui-button>
      <AddSectionModal ref="AddSectionModal"
      v-on:add-section="addSection" />
      <div id="section-pill-container">
        <SectionPill v-for="section in sections"
        :key="section.section_number" :section="section"
        v-on:remove-section="removeSection" />
      </div>
      <div id="btn-container" @click.prevent="registerCourse">
        <Button text="Register" color="blue" 
        size="large" invert_colors :disabled="!formComplete" />
      </div>
    </div>
  </sui-form>
</template>

<script>
import CourseAPI from '@/services/CourseAPI.js';
import SectionPill from '@/components/SectionPill';
import Button from '@/components/Button';
import AddSectionModal from '@/components/AddSectionModal'
import helpers from '@/helpers.js'

export default {
  name: 'RegisterCourse',
  mixins: [helpers],
  components: {
    SectionPill,
    Button,
    AddSectionModal
  },
  data () {
    return {
      course: {
        name: "",
        subject_code: "",
        course_number: null
      },
      sections: [],
      name_input_clicked: false,
      subject_code_input_clicked: false,
      course_number_input_clicked: false,
    }
  },
  computed: {
    showNameInputError() {
      return this.name_input_clicked &&
      this.course.name === ''
    },
    showSubjectCodeInputError() {
      return this.subject_code_input_clicked &&
      this.course.dept === ''
    },
    showCourseNumberInputError() {
      return this.course_number_input_clicked &&
      this.course.course_number == null ||
      this.course.course_number === ""
    },
    sectionHasNumber() {
      return this.section.section_number != null &&
      this.section.section_number !== ""
    },
    formComplete() {
      return this.course.name !== "" &&
        this.course.dept !== "" &&
        this.course.course_number != null &&
        this.course.course_number !== "" &&
        this.sections.length > 0
    }
  },
  created () {
  },
  methods: {
    setNameInputClicked() {
      this.name_input_clicked = true
    },
    setSubjectCodeInputClicked() {
      this.subject_code_input_clicked = true
    },
    setCourseNumberInputClicked() {
      this.course_number_input_clicked = true
    },
    async registerCourse(){
      if(this.formComplete) {
        this.course.instructors = [this.state_user._id]
        const response = await CourseAPI.addCourse(this.course, this.sections);
        const new_course = response.data
        console.log("Receied new course", new_course)
        this.$router.push({name: 'course_info',
          params: {id: new_course._id, reload_page: true}});
      }
    },
    showModal() {
      this.$refs.AddSectionModal.showModal()
    },
    addSection(section) {
      if(this.sectionWithSectionNumberAlreadyAdded(section)) {
        window.alert("Already added a section with this section number")
      } else {
        this.sections.push(section)
        this.sections.sort(this.sectionCompare)
      }
    },
    sectionWithSectionNumberAlreadyAdded(section) {
      let section_found = false
      for(let i = 0; i < this.sections.length; i++) {
        if(this.sections[i].section_number === section.section_number) {
          section_found = true
          break
        }
      }
      return section_found
    },
    removeSection(section_number) {
      this.sections = this.sections.filter((section) => {
        return section.section_number !== section_number
      })
    }
  }
}
</script>

<style scoped>
#enrollment-label {
  margin-top: -1rem;
  border: white solid;
  vertical-align: bottom;
}

#section-pill-container {
  margin-top: 2rem;
}

/* Tablets */
@media (max-width: 1128px) {
  #main {
    width: 95%;
  }
}

</style>