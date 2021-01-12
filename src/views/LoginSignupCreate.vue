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
      }
    }
}
</script>

<style scoped>
#main {
  width: 50%;
  margin: auto;
  margin-top: 2rem;
  text-align: center;
}

#logo-container {
  margin: auto;
}

#logo {
  height: 5rem;
  margin-bottom: 1rem;
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