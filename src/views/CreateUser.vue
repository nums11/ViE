<template>
  <div class="create-user">
    <h1>{{ user.user_id }}</h1>
    <h3>Finish creating your account by inputting the rest of your information</h3>
    <form @submit.prevent="onboardUser">
      <input type="text" placeholder="First Name" v-model="user.first_name">
      <input type="text" placeholder="Last Name" v-model="user.last_name">
      <label for="is_instructor">Are you an instructor?</label>
      <input type="checkbox" v-model="user.is_instructor" name="is_instructor">
      <div>
        <button>Sign Up</button>
      </div>
    </form>
  </div>
</template>

<script>
import AuthAPI from '@/services/AuthAPI.js'

export default {
    name: 'CreateUser',
    components: {

    },
    data () {
      return {
        user: {},
      }
    },
    created () {
      this.user.user_id = this.$route.params.user_id
    },
    methods: {
      async onboardUser() {
        try {
          await AuthAPI.onboardUser(this.user);
          window.location.href = process.env.NODE_ENV === 'production' ?
          "https://cas-auth.rpi.edu/cas/login?service=https%3A%2F%2Fvenue-attend.herokuapp.com%2Fauth%2FloginCAS%-null-null":
          "https://cas-auth.rpi.edu/cas/login?service=http%3A%2F%2Flocalhost%3A4000%2Fauth%2FloginCAS-null-null"
        } catch(error) {
          alert("Something went wrong. Please try again.")
          console.log("Error creating user", error)
        }
      }
    }
}
</script>

<style lang="css" scoped>

</style>