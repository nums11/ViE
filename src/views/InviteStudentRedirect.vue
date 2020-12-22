<template>
  <div>
    <h1>Redirecting...</h1>
  </div>
</template>

<script>
export default {
  name: 'InviteStudentRedirect',
  props: {
  },
  components: {
  },
  data () {
    return {
    }
  },
  created () {
    let section_id = this.$route.params.section_id
    let student_id = this.$route.params.student_id
    let invite_code = this.$route.params.invite_code
    console.log("section_id", section_id)
    console.log("student_id", student_id)
    console.log("invite_code", invite_code)
    let cas_url;
    if(process.env.NODE_ENV === "production") {
      cas_url = `https://cas-auth.rpi.edu/cas/`
      + `login?service=https%3A%2F%2Fvenue-attend.herokuapp.com`
      + `%2Fauth%2Finvite_student-${section_id}-${student_id}-${invite_code}`
    } else {
      cas_url = `https://cas-auth.rpi.edu/cas/`
      + `login?service=http%3A%2F%2Flocalhost%3A4000`
      + `%2Fauth%2Finvite_student-${section_id}-${student_id}-${invite_code}`
    }
    window.location.href = cas_url;
  },
  methods: {
  }
}
</script>

<style lang="css" scoped>
</style>