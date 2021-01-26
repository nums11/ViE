<template>
  <sui-modal v-model="show_modal">
    <sui-modal-header class="center-text">
      Add Section
    </sui-modal-header>
    <sui-modal-content class="center-text" id="main-content">
      <sui-form id="edit-user-form"
      @submit.prevent="addSection">
        <sui-form-field>
          <label class="form-label">Section Number</label>
          <input type="number" 
          v-model="section.section_number"
          class="invite-input"
          onkeypress="return event.charCode >= 48 &&
            event.charCode <= 57"
          min="0" >
        </sui-form-field>
        <div class="mt-2">
          <p>
            Sections with open enrollment do not require
            instructor approval for students to join.
          </p>
          <sui-dropdown selection
          placeholder="Enrollment Status"
          :options="options"
          v-model="selected_option" />
        </div>
        <sui-button
          :disabled="disableAddBtn"
          animated size="small"
          style="background-color:#00b80c; color:white;
          margin-top:2rem;">
          <sui-button-content visible>
            Add Section
          </sui-button-content>
          <sui-button-content hidden>
            <sui-icon name="plus" />
          </sui-button-content>
        </sui-button>
      </sui-form>
    </sui-modal-content>
  </sui-modal>
</template>

<script>
import CourseAPI from '@/services/CourseAPI'

export default {
  name: 'AddSectionModal',
  props: {
    course: {
      type: Object
    }
  },
  data () {
    return {
      show_modal: false,
      section: {
        section_number: null,
        has_open_enrollment: null
      },
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
      selected_option: null
    }
  },
  computed: {
    disableAddBtn() {
      return this.section.section_number == null ||
        this.section.section_number === '' ||
        this.selected_option == null
    }
  },
  created () {

  },
  mounted () {
  },
  methods: {
    async addSection() {
      try {
        if(this.selected_option === 1) 
          this.section.has_open_enrollment = true
        else
          this.section.has_open_enrollment = false
        // Don't actually create the section on the Register
        // Course view
        if(this.course == null) {
          this.$emit('add-section', {
            section_number: this.section.section_number,
            has_open_enrollment: this.section.has_open_enrollment
          })
        } else {
          const response = await CourseAPI.addSectionToCourse(
            this.course._id, this.section)
          const added_section = response.data
          this.$emit('add-section', added_section)
        }
        this.show_modal = false
        this.selected_option = null
        this.resetSection()
      } catch(error) {
        console.log(error)
        window.alert("Sorry, something went wrong")
      }
    },
    showModal() {
      this.show_modal = true
    },
    resetSection() {
      this.section.section_number = null
      this.section.has_open_enrollment = false
    }
  }
}
</script>

<style scoped>
#main-content {
  padding-top: 0;
}

#edit-user-form {
  width: 40%;
}

#enrollment-label {
  margin-top: -1rem;
  border: white solid;
  vertical-align: bottom;
}

/* Phones */
@media (max-width: 744px) {
  #edit-user-form {
    width: 90%;
  }
}
</style>