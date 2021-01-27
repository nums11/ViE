<template>
  <div>
    <h1>Invite Successful. Please wait while you are redirected</h1>
  </div>
</template>

<script>
export default {
  name: 'SuccessfulInviteRedirect',
  props: {
  },
  components: {
  },
  data () {
    return {
    }
  },
  created () {
    let cas_url;
    if(process.env.NODE_ENV === "production") {
      cas_url = "https://cas-auth.rpi.edu/cas/login?service=https%3A%2F%2Fviengage.com%2Fauth%2FloginCAS%-null-null-null"
    } else {
      cas_url = "https://cas-auth.rpi.edu/cas/login?service=http%3A%2F%2Flocalhost%3A4000%2Fauth%2FloginCAS-null-null-null"
    }
    setTimeout(function (){
      window.location.href = cas_url;
    }, 2000)
  },
  methods: {
  }
}
</script>

<style lang="css" scoped>
</style>