<template>
  <div class="landing-page-container" id="landing-page-container" style="text-align:center;">
    <div v-if="!show_login_form">
      <Logo v-bind:show_large_logo="true" />
      <div class="button-container">
        <Button 
          :href="cas_url" 
          :text="'Login'" 
          :config="{
            fontSize: '1.3rem'
          }"
        />
      </div>
      <div class="button-container">
        <Button v-if="!is_production" 
          ref="GetStartedBtn" 
          :text="'Dev Login'" 
          :onClick="showLoginForm"
          :config="{
            fontSize: '1.3rem'
          }"
        />
      </div>
    </div>
    <div v-else>
      <Logo v-bind:show_large_logo="false" />
      <LoginForm ref="LoginForm" />
        <div class="button-container">
          <Button 
            ref="LoginBtn" 
            :text="'Login'" 
            :onClick="login"
            :config="{
              fontSize: '1.3rem'
            }"
          />
        </div>
    </div>
  </div>
</template>

<script>
  import Logo from '@/components/Logo.vue'
  import Button from '@/components/Button.vue'
  import LoginForm from '@/Forms/LoginForm.vue'
  import AuthAPI from '@/services/AuthAPI.js'
  import axios from 'axios';

  export default {
    components: {
      Logo,
      Button,
      LoginForm
    },
    data() {
      return {
        show_login_form: false,
        cas_url: "",
        is_production: Boolean
      }
    },
    created() {
      this.setIsProduction()
      if(process.env.NODE_ENV === "production") {
        this.cas_url = "https://cas-auth.rpi.edu/cas/login?service=https%3A%2F%2Fvenue-attend.herokuapp.com%2Fauth%2FloginCAS-null-null"
      } else {
        this.cas_url = "https://cas-auth.rpi.edu/cas/login?service=http%3A%2F%2Flocalhost%3A4000%2Fauth%2FloginCAS-null-null"
      }
    },
    methods: {
      setIsProduction() {
        this.is_production = process.env.NODE_ENV === 'production'
      },
      showLoginForm() {
        setTimeout(() => {
          this.show_login_form = true
        }, 500)
      },
      login() {
        this.$refs.LoginForm.login()
      },
      signup() {
        this.$refs.LoginForm.signup()
      }
    }
  }
</script>

<style lang="scss">
  .fade_out {
    visibility: hidden;
    opacity: 0;
    transition: visibility 0s linear 8000ms, opacity 8000ms;
  }
  .fade_in {
    visibility: visible;
    opacity: 1;
    transition: visibility 0s linear 0s, opacity 300ms;
  }
  .hidden {
    visibility: hidden;
    opacity: 0;
    transition: visibility 0s 0.2s, opacity 0.2s linear;
  }
  .visible {
    visibility: visible;
    opacity: 1;
    transition: opacity 1s linear;
  }

  .landing-page-container {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
  }

  .dark-mode {
    .landing-page-container {
      background-color: #121419;
    }
  }

  .light-mode {
    .landing-page-container {
      background-color: white;
    }
  }

  .button-container {
    margin-top: 15px;
  }
</style>
