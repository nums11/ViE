<template>
  <div class="manage-students-area">
    <div class="section-info">
      <h2>
        Section
        <input v-if="show_section_edit_forms"
        v-model="section.section_number"
        class="section-number-edit-input" type="text" />
        <h2 v-else style="display: inline-block;">
          {{ section.section_number }}
        </h2>
        <sui-popup content="Edit Section Details" position="top center" inverted>
          <sui-icon @click="toggleSectionEditForms"
          name="edit" style="margin-left:1rem; cursor:pointer;"slot="trigger"/>
        </sui-popup>
        <div class="save-edits-btn-container">
          <sui-button v-if="show_section_edit_forms" @click="updateSection"
          size="small" primary>Save Edits</sui-button>
        </div>
      </h2>
      <p class="enrollment-text" v-if="section.has_open_enrollment">Open Enrollment</p>
      <p class="enrollment-text" v-else>Closed Enrollment</p>
      <div v-if="show_section_edit_forms"
      class="has-open-enrollment-container">
        <sui-popup content="Toggle Enrollment" position="bottom center" inverted>
          <sui-checkbox v-model="section.has_open_enrollment"
          slot="trigger" />
        </sui-popup>
      </div>
      <p>Join Code: {{ section.join_code }}</p>
      <h5>Students ({{ section.students.length }})</h5>
      <div class="student-list">
        <div class="student-row-header">
          <div class="first-name-area">First Name</div>
          <div class="last-name-area">Last Name</div>
          <div class="email-area">User ID</div>
        </div>
          <div v-for="student in section.students" :key="student._id" class="student-row">
            <div class="first-name-area">{{ student.first_name }}</div>
            <div class="last-name-area">{{ student.last_name }}</div>
            <div class="email-area">{{ student.user_id }}</div>
            <div class="remove-btn-area">
              <sui-button @click="removeStudent(section, student)" size="tiny"
              color="red" content="remove" style="margin-left:1rem;" />
            </div>
          </div>
      </div>
      <h5>Pending Aprroval ({{ section.pending_approval_students.length }})</h5>
      <div class="student-list">
        <div class="student-row-header">
          <div class="first-name-area">First Name</div>
          <div class="last-name-area">Last Name</div>
          <div class="email-area">User ID</div>
        </div>
          <div v-for="student in section.pending_approval_students" :key="student._id" class="student-row">
            <div class="first-name-area">{{ student.first_name }}</div>
            <div class="last-name-area">{{ student.last_name }}</div>
            <div class="email-area">{{ student.user_id }}</div>
            <sui-button @click="approveStudent(section, student)" size="tiny" 
            color="blue" content="approve" style="margin-left:2rem;" />
            <sui-button @click="denyStudent(section, student)" size="tiny"
            color="red" content="deny" style="margin-left:1rem;" />
          </div>
      </div>
    </div>
  </div>
</template>
<script>
import SectionAPI from '@/services/SectionAPI'

export default {
  name: 'ManageCourse',
  props: {
    section:  {
      type: Object,
      required: true
    },
  },
  data () {
    return {
      show_section_edit_forms: false
    }
  },
  created() {
  },
  methods: {
    async approveStudent(section, student) {
      let confirmation = confirm(`Are you sure you want to approve` +
        ` ${student.user_id}?`)
      if(confirmation) {
        await SectionAPI.approveStudentIntoSection(
          section._id, student._id)
        this.$router.go()
      }
    },
    async denyStudent(section, student) {
      let confirmation = confirm(`Are you sure you want to deny` +
        ` approval for ${student.user_id}?`)
      if(confirmation) {
        await SectionAPI.denyStudentApprovalIntoSection(
          section._id, student._id)
      this.$router.go()
      }
    },
    async removeStudent(section, student) {
      let confirmation = confirm(`Are you sure you want to remove` +
        ` ${student.user_id} from this section?`)
      if(confirmation) {
        await SectionAPI.removeStudentFromSection(
          section._id, student._id)
        this.$router.go()
      }
    },
    toggleSectionEditForms() {
      if(this.show_section_edit_forms)
        this.updateSection()
      else
        this.show_section_edit_forms = !this.show_section_edit_forms
    },
    async updateSection() {
      try {
        const response = await SectionAPI.updateSection(this.section._id, {
          section_number: this.section.section_number,
          has_open_enrollment: this.section.has_open_enrollment
        })
        const updated_section = response.data
        this.section.section_number = updated_section.section_number
        this.section.has_open_enrollment = updated_section.has_open_enrollment
        this.show_section_edit_forms = false
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong updating the section.")
      }
    }
  }
}
</script>
<style lang="scss">
.manage-students-area {
  margin-bottom: 2rem;
  .action-row {
    height: 50px;
    display: flex;
    align-items: center;
    .left-side {
        flex-grow: 1;
        div {
            display: inline-block;
            margin-right: 20px;
        }
    }
    .right-side {
    }
  }
.student-list {
    .student-row-header {
        display: flex;
        align-items: center;
        height: 35px;
        .checkbox-area {
            width: 100px;
            text-align: center;
        }
        .first-name-area {
          margin-left: 1rem;
            width: 20%;
        }
        .last-name-area {
            width: 20%;
        }
        .email-area {
        }
    }
    .student-row {
        transition: background-color 0.25s;
        cursor: pointer;
        display: flex;
        align-items: center;
        height: 35px;
        .checkbox-area {
            width: 100px;
            text-align: center;
        }
        .first-name-area {
          margin-left: 1rem;
            width: 20%;
        }
        .last-name-area {
            width: 20%;
        }
        .email-area {
          width: 10rem;
        }
    }
    .student-row.active {
        
    }
  }
}
.dark-mode {
    .manage-students-area {
        .student-list {
            .student-row-header {
                background-color: #0e0f12;
            }
            .student-row:hover {
                background-color: #22252e;
            }
            .student-row.active {
                background-color: #2f3340;
            }
        }
    }
}
.light-mode {
    .manage-students-area {
        .student-list {
            .student-row-header {
                background-color: rgba(0, 0, 0, 0.1);
            }
            .student-row:hover {
                background-color: rgba(0, 0, 0, 0.05);
            }
            .student-row.active {
                background-color: rgba(0, 0, 0, 0.07);
            }
        }
    }
}

.section-number-edit-input {
  width: 4rem;
  border: #9e9e9e thin solid;
  border-radius: 1px;
  font-weight: bold;
}

.save-edits-btn-container {
  display: inline-block;
  margin-left: 2rem;
}

.enrollment-text {
  display: inline-block;
}

.has-open-enrollment-container {
  display: inline-block;
  margin-left: 1rem;
  vertical-align: top;
}
</style>