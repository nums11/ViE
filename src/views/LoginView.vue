<template>

  <div class="login-view-container">
    <hide-at breakpoint="small">
      <div class="gradient-container">
          <div class="right-gradient-animation"></div>
      </div>
    </hide-at>
    <div class="login-form-container">
      
      <div class="login-form-center">
        <div class="logo-area">
          <!-- <img :src="require('@/assets/logo.svg')" width="100%" height="100%" /> -->
        </div>
        <div :class="`form-input-slider ${password_stage ? 'password-stage' : 'username-stage'}`">

          <!-- Username Area -->
          <div class="username-area">
            <div>
              <InputField2
                ref="usernameInput"
                v-model="username"
                :validate="{
                  badLength: (x) => [usernameBadLength(x), 'Username must be of length 5'],
                  badChars: (x) => [usernameBadChars(x), 'No spaces allowed'],
                }"
                :config="{
                  width: '100%',
                  icon: 'user',
                  label: 'username',
                  tabDisabled: true,
                  onenter: continueLogin
                }"
              />
            </div>
            <div class="button-area">
              <Button2 
                :style="{marginBottom: '20px'}"
                text="Continue"
                :valid="usernameValid()"
                :disabled="!usernameValid()"
                :onClick="continueLogin"
                :config="{
                  width: '100%',
                  icon: 'right arrow',
                  iconSide: 'right',
                }" />
            </div>
          </div>

          <!-- Password Area -->
          <div class="password-area">
            <div>
              <InputField2
                ref="passwordInput"
                v-model="password"
                :validate="{
                  badLength: (x) => [passwordBadLength(x), 'Password must not be empty']
                }"
                :config="{
                  width: '100%',
                  icon: 'key',
                  label: 'password',
                  type: 'password',
                  tabDisabled: true,
                  onenter: initiateLogin
                }"
              />
            </div>
            <div class="button-area">
              <Button2 
                :style="{marginBottom: '20px', marginRight: '2%'}"
                :onClick="backToUsername"
                :config="{
                  width: '18%',
                  iconOnly: true,
                  icon: 'arrow left',
                  color: 'venue-grey'
                }" />
                <Button2 
                :style="{marginBottom: '20px'}"
                text="Login"
                :valid="passwordValid()"
                :disabled="!passwordValid()"
                :onClick="initiateLogin"
                :config="{
                  width: '80%',
                  icon: 'right arrow',
                  iconSide: 'right'
                }" />
            </div>
          </div>
        </div>
        <transition name="fade" mode="out-in">
          <div class="login-form-response-area" v-if="login_error">
            <div class="icon-area"><i class="icon window close"></i></div>
            <div class="message-area">
              <div class="message-title">ERROR</div>
              <div>Invalid login credentials.</div>
            </div>
          </div>
        </transition>

        <!-- Other Login Area -->
        <div class="alternative-logins-area">
          <Button2 
            :style="{marginBottom: '20px'}"
            text="CAS Login"
            :onClick="initiateCASLogin"
            :config="{
              width: '100%',
              icon: 'sign-in',
              iconSide: 'right',
            }" />
        </div>
      </div>

    </div>
  </div>

</template>
<script>
import InputField2 from '@/components/InputField2.vue'
import {showAt, hideAt} from 'vue-breakpoints'
import Button2 from '@/components/Button2.vue'

export default {
  name: 'LoginView',
  components: {
    showAt,
    hideAt,
    InputField2,
    Button2
  },
  data () {
    return {
      username: "",
      password_stage: false,
      password: "",
      login_error: false
    }
  },
  methods: {
    initiateCASLogin () {

    },
    initiateLogin () {
      if (!this.passwordValid()) return

      this.$store.dispatch('login', {
        user_id: this.username,
        password: this.password
      })
      .then(() => {

        if (this.$route.query.redirect) {
          this.$router.push(this.$route.query.redirect)
        }
        else {
          this.$router.push({name: 'dashboard'})
        }
      })
      .catch((err) => {

        this.login_error = true
        this.password_stage = false

        setTimeout(() => {
          this.$refs.usernameInput.focus ()
        }, 250);
      })
    },
    continueLogin () {
      if (this.usernameValid()) {
        this.password_stage = true
        setTimeout(() => {
          this.$refs.passwordInput.focus ()
        }, 250);
        // this.$refs.passwordInput.focus ()
      }
    },
    backToUsername () {
      this.password_stage = false
    },
    usernameBadLength (x) {
      return x.length > 4
    },
    usernameBadChars (x) {
      return !x.includes(' ')
    },
    passwordBadLength (x) {
      return x.length > 0
    },
    usernameValid () {
      return this.usernameBadLength(this.username) && this.usernameBadChars(this.username)
    },
    passwordValid () {
      return this.passwordBadLength(this.password)
    }
  }
}
</script>
<style lang="scss">
.login-view-container {
  background-color: white;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  color: black;

  .gradient-container {
    height: 100%;
    width: 20%;
    min-width: 20%;

    .right-gradient-animation {
      width: 100%;
      height: 100%;
      background-color: #4CC9FF;

      /* Gradient Animation */
      background: linear-gradient(278deg, #4CC9FF, #C0A6DC, #DFADEB, #FF5E5E);
      background-size: 400% 400%;
      animation: gradientAnimate 5s infinite;
      -moz-animation: gradientAnimate 7s ease infinite;
      animation: gradientAnimate 7s ease infinite;
    }
  }

  @-webkit-keyframes gradientAnimate {
    0%{background-position:0% 50%}
    50%{background-position:100% 50%}
    100%{background-position:0% 50%}
  }
  @-moz-keyframes gradientAnimate {
      0%{background-position:0% 50%}
      50%{background-position:100% 50%}
      100%{background-position:0% 50%}
  }
  @keyframes gradientAnimate {
      0%{background-position:0% 50%}
      50%{background-position:100% 50%}
      100%{background-position:0% 50%}
  }

  .login-form-container {
    flex-grow: 1;

    .login-form-center {
      width: 325px;
      height: 400px;
      box-sizing: border-box;
      padding: 10px 10px;
      margin: 0 auto;
      position: relative;
      top: 45%;
      transform: translateY(-50%);
      overflow: hidden;

      .logo-area {
        height: 80px;
        width: 80px;
        margin: 0 auto;
        background-image: url('~@/assets/logo.svg');
        background-size: 100%;
        margin-bottom: 20px;
      }

      .form-input-slider {
        width: 882px;
        position: relative;
        transition: transform 0.25s;
        // left: 0px;
        // transform: translateX(0px);
        
        &.password-stage {
          // left: -452px;
        transition: transform 0.25s;
        transform: translateX(-320px);
        }

        &.username-stage {
          transition: transform 0.25s;
          transform: translateX(0px);
        }
      }

      .username-area {
        width: 300px;
        display: inline-block;
        box-sizing: border-box;
      }

      .password-area {
        width: 300px;
        display: inline-block;
        margin-left: 20px;
        box-sizing: border-box;
      }

      .login-form-response-area {
        background-color: #FF5E5E;
        padding: 10px 15px 10px 0px;
        border-radius: 5px;
        color: white;
        display: flex;

        .icon-area {
          width: 50px;
          height: 50px;
          font-size: 1.7rem;
          text-align: center;
        }

        .message-area {
          letter-spacing: 1.2px;

          .message-title {
            font-size: 0.8rem;
            transform: translateY(4px);
            opacity: 0.8;
          }
        }
      }

      .alternative-logins-area{
        position: relative;
        margin-top: 20px;
        padding-top: 15px;
        border-top: 1px solid rgba(0, 0, 0, 0.1);

        &:before {
          content: 'or';
          position: absolute;
          left: 0;
          right: 0;
          font-size: 0.9rem;
          text-align: center;
          top: -10px;
        }
      }
    }
  }
}
</style>