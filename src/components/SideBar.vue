<template>
  <div class="side-bar">
    <h2>{{ header }}</h2>
    <h3 v-for="sub_header,index in sub_headers"
    :key="sub_header" class="sub-header">
      {{ sub_header }}
    </h3>
    <div v-for="link,index in links" :key="link.link_name"
    class="side-bar-link-container">
      <div @click="showSection(link.link_name)"
      class="side-bar-link-wrapper"
      :id="`${removeSpaces(link.link_name)}-wrapper`">
        <sui-icon :name="link.icon_name" />
        <p class="side-bar-link">{{ link.link_name }}</p>
      </div>
    </div>
    <div v-if="instructors != null" class="mt-2">
      <h3>Instructors</h3>
      <div v-for="(instructor,index) in instructors"
      :key="index">
        <div class="side-bar-link-container">
          <sui-icon name="graduation cap" />
          <p class="side-bar-link">
            {{ instructor.first_name }}
            {{ instructor.last_name }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SideBar',
  props: {
    header: {
      type: String,
      required: true
    },
    sub_headers: {
      type: Array,
      required: true
    },
    links: {
      type: Array,
      required: true
    },
    instructors: Array
  },
  mixins: [],
  components: {

  },
  data () {
    return {
      active_section: ""
    }
  },
  mounted () {
    this.setDefaultActiveSectionBasedOnRoute()
  },
  methods: {
    setDefaultActiveSectionBasedOnRoute() {
      this.active_section = this.$route.name === 'course_info' ?
      "Meetings" : "Real-Time Portion"
      console.log("Active section", this.active_section)
      let active_section_wrapper = this.getSectionWrapper(
        this.active_section)
      console.log("wrapper", active_section_wrapper)
      active_section_wrapper.classList.add("active-section")
    },
    showSection(section_name) {
      if(this.active_section !== "") {
        let active_section_wrapper = this.getSectionWrapper(
          this.active_section)
        active_section_wrapper.classList.remove("active-section")
      }
      let section_wrapper = this.getSectionWrapper(section_name)
      section_wrapper.classList.add("active-section")
      this.active_section = section_name
      this.$emit('show-section', section_name)
    },
    getSectionWrapper(section_name) {
      return document.getElementById(
        `${this.removeSpaces(section_name)}-wrapper`)
    },
    removeSpaces(str) {
      return str.replace(/\s/g, '');
    }
  }
}
</script>

<style>
.side-bar {
  height: 100%;
  display: inline-block;
  vertical-align: top;
  width: 18%;
}

.sub-header {
  margin-top: 0;
}

.side-bar-link-container {
  margin-top: 1rem;
  margin-left: 0.75rem;
}

.side-bar-link-wrapper {
  display: inline-block;
  cursor: pointer;
  -webkit-transition: color 0.1s linear;
  -ms-transition: color 0.1s linear;
  transition: color 0.1s linear;
}

.side-bar-link-wrapper:hover {
  color: #2c3e50;
}

.side-bar-link {
  display: inline-block;
  margin-left: 0.5rem;
}

.active-section {
  font-weight: bold;
  color: #2c3e50;
}
</style>