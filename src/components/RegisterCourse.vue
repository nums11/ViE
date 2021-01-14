<template>
  <sui-form class="form">
    <div class="form-field">
      <sui-form-field required :error="showNameInputError">
        <sui-popup content="Course Name - e.g. Intro to ViE"
        position="top left" inverted basic>
          <label slot="trigger" class="form-label">Name</label>
        </sui-popup>
        <input v-model="course.name" @blur="setNameInputClicked">
      </sui-form-field>
    </div>
    <div class="form-field">
      <sui-form-field required :error="showSubjectCodeInputError">
        <sui-popup content="Subject Code - e.g. VIE"
        position="top left" inverted basic>
          <label slot="trigger" class="form-label">Subject Code</label>
        </sui-popup>
        <input v-model="course.dept" @blur="setSubjectCodeInputClicked">
      </sui-form-field>
    </div>
    <div class="form-field">
      <sui-form-field required :error="showCourseNumberInputError">
        <sui-popup content="Course Number - e.g. 4200"
        position="top left" inverted basic>
          <label slot="trigger" class="form-label">Course Number</label>
        </sui-popup>
        <input v-model="course.course_number" @blur="setCourseNumberInputClicked"
        type="number">
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
      <sui-form-field>
        <label class="form-label">Section Number</label>
        <input v-model="section.section_number" type="number">
      </sui-form-field>
      <sui-popup content="Sections with open enrollment allow their students
     to join without instructor approval" position="top center" inverted basic>
        <sui-form-field inline slot="trigger">
          <sui-checkbox v-model="section.has_open_enrollment" />
          <label id="enrollment-label">Has Open Enrollment</label>
        </sui-form-field>
      </sui-popup>
      <sui-button @click.prevent="addSection" size="small"
      style="background-color:#00b80c; color: white;"
      content="Add Section" :disabled="!sectionHasNumber" />
      <div id="section-pill-container">
        <SectionPill v-for="section in sections"
        :key="section.section_number" :section="section"
        v-on:remove-section="removeSection" />
      </div>
      <div id="btn-container" @click="registerCourse">
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

export default {
    name: 'RegisterCourse',
    components: {
      SectionPill,
      Button
    },
    data () {
      return {
        course: {
          name: "",
          subject_code: "",
          course_number: null
        },
        sections: [],
        section: {
          has_open_enrollment: false,
        },
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
          this.course.instructor = this.state_user._id
          const response = await CourseAPI.addCourse(this.course, this.sections);
          const new_course = response.data
          console.log("Receied new course", new_course)
          this.$router.push({name: 'course_info',
            params: {id: new_course._id, reload_page: true}});
        }
      },
      addSection() {
        if(this.sectionWithSectionNumberAlreadyAdded()) {
          alert("Already added a section with this section number")
        } else {
          this.sections.push(this.section)
          this.sections.sort(this.compare)

          this.section = { has_open_enrollment: false }
        }
      },
      sectionWithSectionNumberAlreadyAdded() {
        let section_found = false
        for(let i = 0; i < this.sections.length; i++) {
          if(this.sections[i].section_number === this.section.section_number) {
            section_found = true
            break
          }
        }
        return section_found
      },
      compare( a, b ) {
        if ( a.section_number < b.section_number ){
          return -1;
        }
        if ( a.section_number > b.section_number ){
          return 1;
        }
        return 0;
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