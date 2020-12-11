<template>
  <div class="signup">
    <h1>Sign up</h1>
    <h3>Select your university</h3>
    <h5>Rensselaer Polytechnic Institute</h5>
    <a id="cas-login-link" :href="cas_url">
      <button>Login</button>
    </a>
  </div>
</template>

<script>
import AuthAPI from '@/services/AuthAPI.js'

export default {
    name: 'Signup',
    components: {

    },
    data () {
      return {
        cas_url: ""
      }
    },
    created () {
      if(process.env.NODE_ENV === "production") {
        this.cas_url = "https://cas-auth.rpi.edu/cas/login?service=https%3A%2F%2Fvenue-attend.herokuapp.com%2Fauth%2Fsignup"
      } else {
        this.cas_url = "https://cas-auth.rpi.edu/cas/login?service=http%3A%2F%2Flocalhost%3A4000%2Fauth%2Fsignup"
      }
    },
    methods: {

    }
}
</script>

<style lang="css" scoped>
</style>