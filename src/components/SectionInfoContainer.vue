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
      <div class="inline-block float-right">
        <Button text="Invite Students" color="blue"
        size="extra-small" wide />
      </div>
    </div>
    <SectionTable table_name="Pending Approval"
    :students="section.pending_approval_students" />
    <SectionTable table_name="Students"
    :students="section.students" />
    <SectionTable table_name="Invited Students"
    :students="[]" />
  </div>
</template>

<script>
import Button from '@/components/Button'
import SectionTable from '@/components/SectionTable'

export default {
  name: 'SectionInfoContainer',
  props: {
    section: {
      type: Object,
      required: true
    }
  },
  components: {
    Button,
    SectionTable
  },
  data () {
    return {

    }
  },
  async created () {
    console.log("Section", this.section)
  },
  mounted () {
  },
  methods: {

  },
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
</style>