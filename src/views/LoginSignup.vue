<template>
  <div id="main">
    <div id="logo-container">
      <router-link :to="{path: '/'}">
        <img src="@/assets/logo.svg" id="logo" />
        <div id="app-name">ViE</div>
      </router-link>      
    </div>
    <h1 v-if="is_login_view" id="main-header">
      Log in to your ViE account
    </h1>
    <h1 v-else id="main-header">Create an account</h1>
    <h3 id="choose-university-header">Choose your university</h3>
    <div id="university-select-container">
      <select v-model="university_index" id="university-select">
        <option v-for="(name,index) in university_names"
        :value="index">{{ name }}</option>
      </select>
    </div>
    <div v-if="universitySelected" id="verify-container">
      <p v-if="!is_login_view" id="verify-message">Verify that you are a member of 
      <span v-if="university_index === 2">the </span> 
      {{ university_names[university_index] }}</p>
      <div id="verify-button-container" @click="redirectToUniversityLogin">
        <Button :text="is_login_view ? 'Log in' : 'Verify'" color="blue" size="large"
        invert_colors />
      </div>
    </div>
    <p v-if="is_login_view" id="question" >Don't have an account? 
      <router-link :to="{name : 'signup'}">Sign up</router-link>
    </p>
    <p v-else id="question">Already have an account? 
      <router-link :to="{name : 'login'}">Log in</router-link>
    </p>
  </div>
</template>

<script>
import AuthAPI from '@/services/AuthAPI.js'
import Button from '@/components/Button'

export default {
    name: 'Signup',
    components: {
      Button
    },
    data () {
      return {
        university_index: null,
        university_names: [
          "Rensselaer Polytechnic Institute",
          "Lincoln University",
          "University of North Texas"
        ],
        is_login_view: false
      }
    },
    computed: {
      universitySelected() {
        return this.university_index !== null
      }
    },
    created () {
      this.is_login_view = this.$route.name === "login"
    },
    methods: {
      redirectToUniversityLogin() {
        let cas_url;
        if(this.is_login_view)
          cas_url = this.getLoginURL()
        else
          cas_url = this.getSignUpURL()
        window.location.href = cas_url
      },
      getLoginURL() {
        if(process.env.NODE_ENV === "production")
          return "https://cas-auth.rpi.edu/cas/login?service=https%3A%2F%2Fvenue-attend.herokuapp.com%2Fauth%2FloginCAS%-null-null"
        else
          return "https://cas-auth.rpi.edu/cas/login?service=http%3A%2F%2Flocalhost%3A4000%2Fauth%2FloginCAS-null-null"
      },
      getSignUpURL() {
        if(process.env.NODE_ENV === "production")
          return "https://cas-auth.rpi.edu/cas/login?service=https%3A%2F%2Fvenue-attend.herokuapp.com%2Fauth%2Fsignup"
        else
          return "https://cas-auth.rpi.edu/cas/login?service=http%3A%2F%2Flocalhost%3A4000%2Fauth%2Fsignup"
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

#main-header {
  margin-top: 3rem;
  font-size: 3rem;
}

#choose-university-header {
  margin-top: 4rem;
}

#university-select-container {
  margin-top: 2rem;
}

#university-select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 20rem;
  height: 3rem;
  border-radius: 3px;
  background-color: white;
  padding-left: 0.5rem;
  text-align-last: center;
  cursor: pointer;
  margin: auto;
}

#verify-container {
  margin-top: 3rem;
}

#verify-message {
  margin: auto;
}

#verify-button-container {
  margin-top: 2rem;
  display: inline-block;
}

#question {
  margin: auto;
  margin-top: 3rem;
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