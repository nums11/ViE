<template>
  <div class="course-student-list">
    <h1>Click on a student to see their stats</h1>
    <div class="student-list">
      <sui-button v-for="student in students" @click="$emit('show-student-stats',student)" class="student-container" animated>
        <sui-button-content style="font-weight:bold; color: black;" visible>{{ student.first_name }} {{ student.last_name }} ({{ student.user_id }})</sui-button-content>
        <sui-button-content style="font-weight:bold; color: black;" hidden>View stats</sui-button-content>
      </sui-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseStudentList',
  props: {
    students: {
      type: Array,
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
    console.log("Students", this.students)
    this.sortStudents()
  },
  methods: {
    sortStudents() {
      this.students.sort((a,b) => (a.user_id > b.user_id) ? 1 : -1)
    }
  }
}
</script>

<style lang="scss" scoped>
.course-student-list {
  text-align: center;
  margin-top: 1rem;
  height: 40rem;
}

.student-list {
  width: 30%;
  margin: auto;
  height: 90%;
  overflow-y: auto;

  .student-container {
    margin-top: 1rem;
    width: 90%;
  }
}
</style>