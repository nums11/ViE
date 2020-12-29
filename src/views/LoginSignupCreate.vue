<template>
  <div id="main">
    <div id="logo-container">
      <router-link :to="{path: '/'}">
        <img src="@/assets/logo.svg" id="logo" />
        <div id="app-name">ViE</div>
      </router-link>      
    </div>
    <LoginSignup v-if="$route.name === 'login' || 
    $route.name === 'signup'"
    :is_login_view="$route.name === 'login'" />
    <CreateUser v-else />
  </div>
</template>

<script>
import LoginSignup from '@/components/LoginSignup'
import CreateUser from '@/components/CreateUser'

export default {
    name: 'LoginSignupCreate',
    components: {
      LoginSignup,
      CreateUser
    },
    data () {
      return {
        university_index: null,
        university_names: [
          "Rensselaer Polytechnic Institute",
          "Lincoln University",
          "University of North Texas"
        ],
        is_login_view: false,
        error_msg: null
      }
    },
    computed: {
      universitySelected() {
        return this.university_index !== null
      }
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

/deep/ #button-container {
  margin-top: 2rem;
  display: inline-block;
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