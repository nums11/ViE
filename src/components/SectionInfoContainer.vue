<template>
  <div class="section-info-container">
    <div class="section-header inline-block">
      Section {{ section.section_number }}
    </div>
    <p class="ml-2 inline-block">
      {{ section.has_open_enrollment ?
        'Open Enrollemnt' : 'Closed Enrollemnt'}}
    </p>
    <div>
      <p class="inline-block">
        Join Code: {{ section.join_code }}
      </p>
      <div @click="showModal"
      class="inline-block float-right">
        <Button text="Invite Students" color="blue"
        size="extra-small" wide />
      </div>
    </div>
    <SectionTable v-if="!section.has_open_enrollment"
    table_name="Pending Approval" :section_id="section._id"
    :students="section.pending_approval_students"
    v-on:approve-student="approveStudent" />
    <SectionTable table_name="Students"
    :students="section.students" :section_id="section._id"
    ref="StudentsTable" />
    <InviteModal ref="InviteModal"
    :course="course" :section="section" />
  </div>
</template>

<script>
import Button from '@/components/Button'
import SectionTable from '@/components/SectionTable'
import InviteModal from '@/components/InviteModal'

import EmailAPI from '@/services/EmailAPI'

export default {
  name: 'SectionInfoContainer',
  props: {
    course: {
      type: Object,
      required: true
    },
    section: {
      type: Object,
      required: true
    }
  },
  components: {
    Button,
    SectionTable,
    InviteModal
  },
  data () {
    return {
      show_modal: false,
      invite_email: "",
      sending_email: false
    }
  },
  computed: {
    disableInviteBtn() {
      return this.invite_email.length === 0
        || !this.invite_email.includes('@')
        || !this.invite_email.includes('.')
    }
  },
  created () {
  },
  mounted () {
  },
  methods: {
    showModal() {
      this.$refs.InviteModal.showModal()
    },
    async inviteStudent() {
      try {
        this.sending_email = true
        const course = this.course, section = this.section
        const instructor = course.instructor
        await EmailAPI.sendInviteEmail(course.name, course.dept,
          course.course_number, section.section_number, 
          `${instructor.first_name} ${instructor.last_name}`,
          section.join_code, this.invite_email)
        alert(`Join code sent to ${this.invite_email}`)
        this.invite_email = ""
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong sending your email")
      }
      this.sending_email = false
    },
    approveStudent(student) {
      this.$refs.StudentsTable.addStudent(student)
    }
  }
}
</script>

<style scoped>
.section-info-container {
  /*border: green solid;*/
  max-height: 80rem;
  overflow-y: auto;
  /*padding-left: 0.5rem;*/
  padding-right: 1rem;
}

.section-info-container:not(:first-of-type) {
  margin-top: 4rem;
}

.section-header {
  font-weight: bold;
  color: #252b36bf;
  font-size: 1.5rem;
}

#csv-img {
  border-radius: 5px;
  width: 16rem;
}
</style>