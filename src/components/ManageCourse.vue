<template>
  <div>
    <SectionDetails v-for="section in course.sections"
    :key="section._id" :section="section" />
  </div>
</template>

<script>
import SectionAPI from '@/services/SectionAPI'
import SectionDetails from '@/components/SectionDetails'

export default {
  name: 'ManageCourse',
  props: {
    course:  {
      type: Object,
      required: true
    },
    org: Object
  },
  components: {
    SectionDetails
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
      console.log("Yup")
    }
  }
}
</script>

<style lang="scss">
</style>