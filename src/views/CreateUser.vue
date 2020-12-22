<template>
  <div id="main">
    <div id="logo-container">
      <router-link :to="{path: '/'}">
        <img src="@/assets/logo.svg" id="logo" />
        <div id="app-name">ViE</div>
      </router-link>      
    </div>
    <h1 id="main-header">
      Log in to your ViE account
    </h1>

    <h1>{{ user.user_id }}</h1>
    <h3>Finish creating your account by inputting the rest of your information</h3>
    <form @submit.prevent="onboardUser">
      <input type="text" placeholder="First Name" v-model="user.first_name">
      <input type="text" placeholder="Last Name" v-model="user.last_name">
      <div v-if="!inviting_student">
        <label for="is_instructor">Are you an instructor?</label>
        <input type="checkbox" v-model="user.is_instructor" name="is_instructor">
      </div>
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
        inviting_student: false
      }
    },
    created () {
      this.user.user_id = this.$route.params.user_id
      this.section_id = this.$route.params.optional_invited_section_id
      this.invite_code = this.$route.params.optional_invite_code
      if(this.section_id !== "null")
        this.inviting_student = true
    },
    methods: {
      async onboardUser() {
        try {
          await AuthAPI.onboardUser(this.user, this.section_id, this.invite_code);
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

<style scoped>
#main {
  width: 50%;
  margin: auto;
  margin-top: 4rem;
  text-align: center;
}

#logo-container {
  margin: auto;
}

#logo {
  height: 5rem;
  display: inline-block;
  vertical-align: top;
}

#app-name {
  display: inline-block;
  vertical-align: top;
  margin-left: 0.5rem;
  font-size: 4rem;
  color: #2c3e50;
  font-weight: 500;
  height: 5rem;
  padding-top: 2rem;
}


/* Tablets */
@media (max-width: 1128px) {
  #main {
    width: 70%;
  }
}

/* Phones */
@media (max-width: 744px) {
  #main {
    width: 90%;
  }
}
</style>