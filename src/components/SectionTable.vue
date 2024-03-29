<template>
  <div class="section-table">
    <div class="bold">
      {{ table_name }} ({{ students.length }})
    </div>
    <div class="table">
      <div class="table-wrapper">
        <sui-table v-if="table_name === 'Students' ||
        table_name === 'Pending Approval'" striped>
          <sui-table-header>
            <sui-table-row>
              <sui-table-header-cell>First Name</sui-table-header-cell>
              <sui-table-header-cell>Last Name</sui-table-header-cell>
              <sui-table-header-cell>User ID</sui-table-header-cell>
              <sui-table-header-cell>Email</sui-table-header-cell>
              <sui-table-header-cell v-if="table_name === 'Students'">
                Remove
              </sui-table-header-cell>
              <sui-table-header-cell
              v-if="table_name === 'Pending Approval'">
                Approve
              </sui-table-header-cell>
              <sui-table-header-cell
              v-if="table_name === 'Pending Approval'">
                Deny
              </sui-table-header-cell>
            </sui-table-row>
          </sui-table-header>
          <sui-table-body>
            <sui-table-row v-for="student in students"
            :key="student.user_id">
              <sui-table-cell>
                {{ student.first_name }}
              </sui-table-cell>
              <sui-table-cell>
                {{ student.last_name }}
              </sui-table-cell>
              <sui-table-cell>
                {{ student.user_id }}
              </sui-table-cell>
              <sui-table-cell>
                {{ student.email }}
              </sui-table-cell>
              <sui-table-cell v-if="table_name === 'Students'">
                <sui-button class="table-btn" size="mini"
                color="red" @click="handleStudent(student, 'remove')">
                  <sui-icon name="x"/>
                </sui-button>
              </sui-table-cell>
              <sui-table-cell v-if="table_name === 'Pending Approval'">
                <sui-button class="table-btn" size="mini"
                style="background-color:#00b80c;color:white;"
                @click="handleStudent(student,'approve')">
                  <sui-icon name="check"/>
                </sui-button>
              </sui-table-cell>
              <sui-table-cell v-if="table_name === 'Pending Approval'">
                <sui-button class="table-btn" size="mini"
                color="red" @click="handleStudent(student, 'deny')">
                  <sui-icon name="x"/>
                </sui-button>
              </sui-table-cell>
            </sui-table-row>
          </sui-table-body>
        </sui-table>
        <sui-table v-else striped>
          <sui-table-header>
            <sui-table-row>
              <sui-table-header-cell>User ID</sui-table-header-cell>
              <sui-table-header-cell>Cancel Invite</sui-table-header-cell>
            </sui-table-row>
          </sui-table-header>
          <sui-table-body>
            <sui-table-row v-for="student in students"
            :key="student.user_id">
              <sui-table-cell>
                {{ student.user_id }}
              </sui-table-cell>
              <sui-table-cell>
                <sui-button class="table-btn" size="mini"
                color="grey">
                  <sui-icon name="x"/>
                </sui-button>
              </sui-table-cell>
            </sui-table-row>
          </sui-table-body>
        </sui-table>
      </div>
    </div>
  </div>
</template>

<script>
import SectionAPI from '@/services/SectionAPI'

export default {
  name: 'SectionTable',
  props: {
    table_name: {
      type: String,
      required: true
    },
    section_id: {
      type: String,
      required: true
    },
    students: {
      type: Array,
      required: true
    }
  },
  data () {
    return {

    }
  },
  created () {
  },
  methods: {
    async handleStudent(student, operation) {
      const confirmation_msg = this.getConfirmationMsg(
        student, operation)
      if(!confirm(confirmation_msg))
        return;

      try {
        if(operation === 'approve') {
          await SectionAPI.approveStudentIntoSection(
            this.section_id, student._id)
          this.$emit('approve-student', student)
        } else if(operation === 'deny') {
          await SectionAPI.denyStudentApprovalIntoSection(
            this.section_id, student._id)
          this.$emit('deny-student', student)
        } else {
          await SectionAPI.removeStudentFromSection(
            this.section_id, student._id)
        }
        this.removeStudent(student._id)
      } catch(error) {
        console.log(error)
        window.alert("Sorry, something went wrong")
      }
    },
    getConfirmationMsg(student, operation) {
      let msg = "Are you sure you want to "
      if(operation === "approve")
        msg += "approve "
      else if(operation === "deny")
        msg += "deny "
      else
        msg += "remove "
      msg += `${student.first_name} ${student.last_name}`
      if(operation === "deny" || operation === "remove")
        msg += " from"
      else
        msg += " into"
       msg += " your course?"
      return msg
    },
    removeStudent(student_object_id) {
      for(let i = 0; i < this.students.length; i++) {
        if(this.students[i]._id === student_object_id) {
          this.students.splice(i,1)
          break
        }
      }
    },
    addStudent(student) {
      this.students.push(student)
    }
  },
}
</script>

<style scoped>
.section-table {
  margin-top: 2rem;
}

.table{
  max-height: 20rem;
  overflow-y: auto;
  margin-top: 1rem;
}

.table-wrapper {
  width: 99%;
}
.table-btn {
  width: 3rem;
}
</style>