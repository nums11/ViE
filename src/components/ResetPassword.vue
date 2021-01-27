<template>
  <div id="login-signup">
    <h1 class="form-header">Reset Your Password</h1>
    <sui-form class="form">
      <div class="form-field">
        <sui-form-field>
          <label class="form-label">Email</label>
          <input v-model="email" readonly>
        </sui-form-field>
      </div>
      <div class="form-field">
        <sui-form-field required :error="showPasswordInputError">
          <label class="form-label">New Password</label>
          <sui-popup content="Passwords must be at least 6 characters long"
          position="top left" inverted basic>
            <input @blur="setPasswordInputClicked" v-model="new_password"
            slot="trigger" type="password">
          </sui-popup>
        </sui-form-field>
      </div>
      <div class="form-field">
        <sui-form-field required :error="showConfirmPasswordInputError">
          <label class="form-label">Confirm Password</label>
          <input @blur="setConfirmPasswordInputClicked"
          v-model="confirmed_password" type="password">
        </sui-form-field>
      </div>
      <div @click="resetPassword" id="button-container">
        <Button text="Reset" color="blue" size="large"
        invert_colors :disabled="!formComplete"/>
      </div>
    </sui-form>
  </div>
</template>

<script>
import Button from '@/components/Button'
import AuthAPI from '@/services/AuthAPI'

export default {
  name: 'ResetPassword',
  components: {
    Button
  },
  data () {
    return {
      email: "",
      new_password: "",
      confirmed_password: "",
      password_input_clicked: false,
      confirm_password_input_clicked: false,
    }
  },
  computed: {
    showPasswordInputError() {
      return this.password_input_clicked &&
      this.new_password.length < 6
    },
    showConfirmPasswordInputError() {
      return this.password_input_clicked &&
      this.confirm_password_input_clicked &&
      this.new_password !== this.confirmed_password
    },
    formComplete() {
      return this.new_password.length >= 6 &&
      this.new_password === this.confirmed_password
    }
  },
  created () {
    this.email = this.$route.params.email
  },
  methods: {
    setPasswordInputClicked() {
      this.password_input_clicked = true
    },
    setConfirmPasswordInputClicked() {
      this.confirm_password_input_clicked = true
    },
    async resetPassword() {
      if(this.formComplete) {
        try {
          const response = await AuthAPI.updatePassword(this.email,
            this.new_password)
          window.alert("Password Reset")
          this.$router.push({name: 'login'})
        } catch(error) {
          console.log(error)
          window.alert("Sorry, something went wrong")
        }
      }
    }
  }
}
</script>

<style scoped>
#button-container {
  margin-bottom: 2rem;
}
</style>