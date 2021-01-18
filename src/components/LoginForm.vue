<template>
  <sui-form class="form">
    <div class="form-field">
      <sui-form-field>
        <label class="form-label">User Id</label>
        <input v-model="user.user_id">
      </sui-form-field>
      <p v-if="show_user_id_err" class="error">
        User Id Required
      </p>
    </div>
    <div class="form-field">
      <sui-form-field>
        <label class="form-label">Password</label>
        <input v-model="user.password" type="password">
      </sui-form-field>
      <p v-if="show_password_err" class="error">
        Password Required
      </p>
      <p @click="showForgotPasswordModal"
      id="forgot-password-text">Forgot Password?</p>
    </div>
    <div class="mt-2" @click="login">
      <Button text="Login" color="blue" size="large"
      invert_colors />
    </div>
    <p v-if="show_invalid_credentials" class="error">
      Invalid User Id or Password
    </p>
    <ForgotPasswordModal ref="ForgotPasswordModal" />
  </sui-form>
</template>

<script>
import Button from '@/components/Button'
import ForgotPasswordModal from
'@/components/ForgotPasswordModal'

export default {
  name: 'LoginForm',
  components: {
    Button,
    ForgotPasswordModal
  },
  data () {
    return {
      user: {
        user_id: "",
        password: ""
      },
      show_user_id_err: false,
      show_password_err: false,
      show_invalid_credentials: false,
    }
  },
  computed: {
  },
  created () {

  },
  methods: {
    async login() {
      this.show_user_id_err = false
      this.show_password_err = false
      this.show_invalid_credentials = false
      let form_valid = true
      if(this.user.user_id === ''){
        this.show_user_id_err = true
        form_valid = false
      }
      if(this.user.password === ''){
        this.show_password_err = true
        form_valid = false
      }
      if(form_valid) {
        try {
          const response = await this.$store.dispatch('login', this.user)
          this.$router.push({name: 'dashboard'})
        } catch(error) {
          if(error.response.status === 404)
            this.show_invalid_credentials = true
          else {
            console.log(error)
            alert("Something went wrong. Please try again")
          }
        }
      }
    },
    showForgotPasswordModal() {
      this.$refs.ForgotPasswordModal.showModal()
    }
  }
}
</script>

<style scoped>
.form {
  width: 60%;
}

.error {
  color: #FF0000;
}

#forgot-password-text {
  color: #4183C4;
  font-weight: bold;
  cursor: pointer;
  display: inline-block;
}
</style>