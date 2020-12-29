<template>
  <div class="section-pill-container">
    <sui-button @click="$emit('remove-section', section.section_number)"
    icon="x" size="mini" />
    <div class="section-pill">
      <div class="float-left">Section {{ section.section_number }} </div>
      <div class="float-right">
        <span v-if="section.has_open_enrollment">Open Enrollment</span>
        <span v-else>Closed enrollment</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SectionPill',
  props: {
    section: {
      type: Object,
      required: true
    }
  },
  components: {
  },
  data () {
    return {
    }
  },
  created () {
  },
  methods: {
  }
}
</script>

<style scoped>
.section-pill-container {
  width: 80%;
  margin: auto;
  margin-top: 1rem;
}

.section-pill {
  border-radius: 3px;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  padding-top: 0.35rem;
  width: 70%;
  height: 2rem;
  background-color: #E0E1E2;
  display: inline-block;
  vertical-align: top;
  margin-left: 1rem;
}

/* Phones */
@media (max-width: 744px) {
  .section-pill-container {
    width: 100%;
    font-size: 0.8rem;
  }
  .section-pill {
    width: 80%;
  }
}
</style>