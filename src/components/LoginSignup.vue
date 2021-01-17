<template>
  <div id="login-signup">
    <h1 v-if="is_login_view" class="form-header">
      Log in to your ViE account
    </h1>
    <h1 v-else class="form-header">Create an account</h1>
    <h3 id="choose-university-header">Choose your university</h3>
    <div id="university-select-container">
      <select v-model="university_index" id="university-select"
      @change="selectUniversity">
        <option v-for="(name,index) in university_names"
        :value="index">
          {{ name }}
        </option>
      </select>
    </div>
    <div v-if="show_btn" id="verify-container">
      <p v-if="!is_login_view" id="verify-message">
        {{ university_index === 0 ?
          "Verify that you are a member of Rensselaer Polytechnic Institute":
          "Click the button below to sign up" }}
      </p>
      <div id="button-container" @click="redirectToUniversityLogin">
        <Button :text="btn_text" color="blue"
        size="large"
        invert_colors />
      </div>
    </div>
    <LoginForm v-else-if="show_login_form" />
    <p v-if="error_msg != null" id="error-msg">{{ error_msg }}</p>
    <p v-if="is_login_view" id="question" >Don't have an account? 
      <router-link :to="{name : 'signup'}">Sign up</router-link>
    </p>
    <p v-else id="question">Already have an account? 
      <router-link :to="{name : 'login'}">Log in</router-link>
    </p>
  </div>
</template>

<script>
import Button from '@/components/Button'
import LoginForm from '@/components/LoginForm'

export default {
  name: 'LoginSignup',
  components: {
    Button,
    LoginForm
  },
  data () {
    return {
      university_index: null,
      university_names: [
        "Rensselaer Polytechnic Institute",
        "Other"
      ],
      is_login_view: false,
      error_msg: null,
      show_btn: false,
      show_login_form: false,
      btn_text: ""
    }
  },
  computed: {
  },
  created () {
    this.setIsLoginView()
    this.checkForError()
  },
  methods: {
    setIsLoginView() {
      this.is_login_view = this.$route.name === "login"
    },
    checkForError() {
      if(this.is_login_view &&
        this.$route.params.user_does_not_exist === "true") {
        this.error_msg = "No account found. "
          + "Are you sure you didn't mean to sign up?"
      } else if(!this.is_login_view &&
        this.$route.params.user_exists === "true"){
        this.error_msg = "An account already exists. "
          + "Are you sure you didn't mean to log in?"
      }
    },
    redirectToUniversityLogin() {
      let cas_url;
      if(this.is_login_view) {
        cas_url = this.getLoginURL()
        window.location.href = cas_url
      } else {
        if(this.university_index === 0) { //RPI
          cas_url = this.getSignUpURL()
          window.location.href = cas_url
        } else {
          this.$router.push({name: 'create_user'})
        }
      }
    },
    getLoginURL() {
      if(process.env.NODE_ENV === "production")
        return "https://cas-auth.rpi.edu/cas/login?service=https%3A%2F%2Fviengage.com%2Fauth%2FloginCAS-null-null"
      else
        return "https://cas-auth.rpi.edu/cas/login?service=http%3A%2F%2Flocalhost%3A4000%2Fauth%2FloginCAS-null-null"
    },
    getSignUpURL() {
      if(process.env.NODE_ENV === "production")
        return "https://cas-auth.rpi.edu/cas/login?service=https%3A%2F%2Fviengage.com%2Fauth%2Fsignup_redirect"
      else
        return "https://cas-auth.rpi.edu/cas/login?service=http%3A%2F%2Flocalhost%3A4000%2Fauth%2Fsignup_redirect"
    },
    selectUniversity() {
      if(this.is_login_view) {
        if(this.university_index === 0) //RPI
          this.btn_text = "Login"
        else {
          this.btn_text = "Show Form"
          this.show_btn = false
          this.show_login_form = true
          return
        }
      } else {
        if(this.university_index === 0) //RPI
          this.btn_text = "Verify"
        else
          this.btn_text = "Sign Up"
      }
      this.show_btn = true
    }
  }
}
</script>

<style scoped>
#login-signup {
  padding-bottom: 2rem;
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

#error-msg {
  background-color: #FF00001A;
  border: #FF00001A solid;
  color: #FF0000;
  font-weight: bold;
  height: 3rem;
  width: 72.5%;
  margin: auto;
  margin-top: 3rem;
  padding-top: 0.75rem;
  border-radius: 5px;
}

#question {
  margin: auto;
  margin-top: 3rem;
  font-weight: bold;
}

/* Tablets */
@media (max-width: 1128px) {
  #error-msg {
    width: 85%;
  }
}

/* Phones */
@media (max-width: 744px) {
  #error-msg {
    padding-top: 0.5rem;
    width: 100%;
    height: 4rem;
  }
}
</style>