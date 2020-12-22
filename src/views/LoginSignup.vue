<template>
  <div id="main">
    <div id="logo-container">
      <router-link :to="{path: '/'}">
        <img src="@/assets/logo.svg" id="logo" />
        <div id="app-name">ViE</div>
      </router-link>      
    </div>
    <h1 id="signup-header">Create an account</h1>
    <h3 id="choose-university-header">Choose your university</h3>
    <div id="university-select-container">
      <select v-model="university_index" id="university-select">
        <option v-for="(name,index) in university_names"
        :value="index">{{ name }}</option>
<!--         <option value="1">Lincoln University</option>
        <option value="2">University of North Texas</option> -->
      </select>
    </div>
    <div v-if="universitySelected" id="verify-container">
      <p>Verify that you are a member of 
      <span v-if="university_index === 2">the </span> 
      {{ university_names[university_index] }}</p>
      <div id="verify-button-container" @click="redirectToUniversityLogin">
        <Button text="Verify" color="blue" size="large"
        invert_colors />
      </div>
    </div>
<!--     <h1>Sign up</h1>
    <h3>Select your university</h3>
    <h5>Rensselaer Polytechnic Institute</h5>
    <a id="cas-login-link" :href="cas_url">
      <button>Login</button>
    </a> -->
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
        ]
      }
    },
    computed: {
      universitySelected() {
        return this.university_index !== null
      }
    },
    created () {
    },
    methods: {
      redirectToUniversityLogin() {
        console.log("in here")
        let cas_url;
        if(process.env.NODE_ENV === "production") {
          cas_url = "https://cas-auth.rpi.edu/cas/login?service=https%3A%2F%2Fvenue-attend.herokuapp.com%2Fauth%2Fsignup"
        } else {
          cas_url = "https://cas-auth.rpi.edu/cas/login?service=http%3A%2F%2Flocalhost%3A4000%2Fauth%2Fsignup"
        }
        window.location.href = cas_url
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

#signup-header {
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
  padding-right: 0.5rem;
  cursor: pointer;
}

#verify-container {
  margin-top: 3rem;
}

#verify-button-container {
  margin-top: 2rem;
}
</style>