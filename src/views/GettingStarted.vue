<template>
  <div class="getting-started">
    <h1>Getting Started</h1>
    <h3>Don't have an account? Sign up with the form below.</h3>
    <form @submit.prevent="onboardUser">
      <input type="text" placeholder="First Name" v-model="user.first_name">
      <input type="text" placeholder="Last Name" v-model="user.last_name">
      <input type="text" placeholder="RCS ID" v-model="user.user_id">
      <button>Create Account</button>
    </form>
    <p v-if="show_error_msg" class="error-msg">
    User with this user id already exists. Login by
    clicking the button below.</p>
    <h3>Or
      <a id="cas-login-link" :href="cas_url">
        <button>Login</button>
      </a>
    </h3>
  </div>
</template>

<script>
import AuthAPI from '@/services/AuthAPI.js'

export default {
    name: 'CourseOrgInfo',
    components: {

    },
    data () {
      return {
        user: {
          is_instructor: true
        },
        cas_url: "",
        show_error_msg: false
      }
    },
    created () {
      if(process.env.NODE_ENV === "production") {
        this.cas_url = "https://cas-auth.rpi.edu/cas/login?service=https%3A%2F%2Fvenue-attend.herokuapp.com%2Fauth%2FloginCAS%-null-null"
      } else {
        this.cas_url = "https://cas-auth.rpi.edu/cas/login?service=http%3A%2F%2Flocalhost%3A4000%2Fauth%2FloginCAS-null-null"
      }
    },
    methods: {
      async onboardUser(evt){
        this.show_error_msg = false
        this.setEmail()
        try {
          await AuthAPI.onboardUser(this.user);
          document.getElementById('cas-login-link').click()
        } catch(error) {
          if(error.response.status === 409)
            this.show_error_msg = true
        }
      },
      setEmail() {
        this.user.email = this.user.user_id + "@rpi.edu"
      },
    }
}
</script>

<style lang="css" scoped>
.error-msg {
  margin-top: 1rem;
  color: red;
}
</style>