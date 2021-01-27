<template>
  <div>
    <h1 class="form-header">Finish creating your account</h1>
    <sui-form class="form">
      <div class="form-field">
        <sui-form-field required :error="showFirstNameInputError">
          <label class="form-label">First Name</label>
          <input @blur="setFirstNameInputClicked" v-model="user.first_name">
        </sui-form-field>
      </div>
      <div class="form-field">
        <sui-form-field required :error="showLastNameInputError">
          <label class="form-label">Last Name</label>
          <input @blur="setLastNameInputClicked" v-model="user.last_name">
        </sui-form-field>
      </div>
      <div class="form-field">
        <sui-form-field required :error="showEmailInputError">
          <label class="form-label">Email</label>
          <input @blur="setEmailInputClicked" v-model="user.email"
          :readonly="rpi_user_id != null" type="email">
          <p v-if="show_existing_email_error" class="mt-1 error">
            Account with this email already exists
          </p>
        </sui-form-field>
      </div>
      <div class="form-field">
        <sui-form-field required :error="showUserIDInputError">
          <sui-popup content="You will use your User Id to log into ViE"
          position="top left" inverted basic>
            <label slot="trigger" class="form-label">User Id</label>
          </sui-popup>
          <sui-popup content="User Id must be at least 3 characters long"
          position="top left" inverted basic>
            <input v-model="user.user_id" :readonly="rpi_user_id != null"
            @blur="setUserIDInputClicked" slot="trigger">
          </sui-popup>
          <p v-if="show_existing_user_id_error" class="mt-1 error">
            User with this user id already exists
          </p>
        </sui-form-field>
      </div>
      <div v-if="rpi_user_id == null" class="form-field">
        <sui-form-field required :error="showPasswordInputError">
          <label class="form-label">Password</label>
          <sui-popup content="Passwords must be at least 6 characters long"
          position="top left" inverted basic>
            <input @blur="setPasswordInputClicked" v-model="user.password"
            type="password" slot="trigger">
          </sui-popup>
        </sui-form-field>
        <div class="mt-3">
          <sui-form-field required :error="showConfirmPasswordInputError">
            <label class="form-label">Confirm Password</label>
              <input @blur="setConfirmPasswordInputClicked"
              v-model="confirmed_password"
              type="password">
          </sui-form-field>
        </div>
      </div>
      <div class="form-field">
        <sui-form-field>
          <sui-checkbox label="Are you an instructor?"
          v-model="user.is_instructor"/>
        </sui-form-field>
      </div>
      <div @click="onboardUser" id="button-container">
        <Button text="Sign up" color="blue" size="large"
        invert_colors :disabled="!formComplete"/>
      </div>
    </sui-form>
  </div>
</template>

<script>
import AuthAPI from '@/services/AuthAPI'
import Button from '@/components/Button'

export default {
  name: 'CreatUser',
  components: {
    Button,
  },
  data () {
    return {
      user: {
        first_name: "",
        last_name: "",
        user_id: "",
        email: "",
        password: ""
      },
      confirmed_password: "",
      first_name_input_clicked: false,
      last_name_input_clicked: false,
      user_id_input_clicked: false,
      email_input_clicked: false,
      confirm_password_input_clicked: false,
      rpi_user_id: null,
      show_existing_user_id_error: false,
      show_existing_email_error: false,
      non_rpi_user_ids: [],
      non_rpi_emails: []
    }
  },
  computed: {
    showFirstNameInputError() {
      return this.first_name_input_clicked &&
      this.user.first_name === ''
    },
    showLastNameInputError() {
      return this.last_name_input_clicked &&
      this.user.last_name === ''
    },
    showUserIDInputError() {
      return this.user_id_input_clicked &&
      this.user.user_id.length < 3
    },
    showEmailInputError() {
      return this.email_input_clicked &&
      (this.user.email === '' ||
        !this.user.email.includes('@'))
    },
    showPasswordInputError() {
      return this.password_input_clicked &&
      this.user.password.length < 6
    },
    showConfirmPasswordInputError() {
      return this.password_input_clicked &&
      this.confirm_password_input_clicked &&
      this.user.password !== this.confirmed_password
    },
    formComplete() {
      return this.user.first_name !== "" &&
        this.user.last_name !== "" &&
        this.user.user_id.length >= 3 &&
        this.user.email !== "" &&
        this.user.email.includes("@") &&
        ((this.rpi_user_id == null &&
          this.user.password.length >= 6 &&
          this.user.password === this.confirmed_password) ||
        this.rpi_user_id != null)
    }
  },
  created () {
    this.checkIfUserIsFromRPI()
  },
  methods: {
    setFirstNameInputClicked() {
      this.first_name_input_clicked = true
    },
    setLastNameInputClicked() {
      this.last_name_input_clicked = true
    },
    setUserIDInputClicked() {
      this.user_id_input_clicked = true
    },
    setEmailInputClicked() {
      this.email_input_clicked = true
    },
    setPasswordInputClicked() {
      this.password_input_clicked = true
    },
    setConfirmPasswordInputClicked() {
      this.confirm_password_input_clicked = true
    },
    async onboardUser() {
      this.show_existing_email_error = false
      this.show_existing_user_id_error = false
      if(this.formComplete) {
        if(this.rpi_user_id == null) {
          if(this.non_rpi_emails.includes(this.user.email)) {
            this.show_existing_email_error = true
            return
          } else if(this.non_rpi_user_ids.includes(
            this.user.user_id)) {
            this.show_existing_user_id_error = true
            return
          }
        }
        try {
          await AuthAPI.onboardUser(this.user);
          if(this.rpi_user_id == null)
            this.loginNonCas()
          else
            this.loginCas()
        } catch(error) {
          window.alert("Something went wrong")
          console.log("Error creating user", error)
        }
      }
    },
    checkIfUserIsFromRPI() {
      this.rpi_user_id = this.$route.params.rpi_user_id
      if(this.rpi_user_id != null){
        this.user.user_id = this.rpi_user_id
        this.user.email = `${this.rpi_user_id}@rpi.edu`
        this.user.is_rpi_member = true
      } else {
        this.getNonRPIUserIDs()
      }
    },
    async getNonRPIUserIDs() {
      try {
        const response = await AuthAPI.getNonRPIUserIDsAndEmails()
        const data = response.data
        this.non_rpi_user_ids = data.user_ids
        this.non_rpi_emails = data.emails
      } catch(error) {
        console.log(error)
        window.alert("Sorry, something went wrong")
      }
    },
    loginCas() {
      window.location.href = process.env.NODE_ENV === 'production' ?
      "https://cas-auth.rpi.edu/cas/login?service=https%3A%2F%2Fviengage.com%2Fauth%2FloginCAS-null-null-null-true":
      "https://cas-auth.rpi.edu/cas/login?service=http%3A%2F%2Flocalhost%3A4000%2Fauth%2FloginCAS-null-null-null-true"
    },
    async loginNonCas() {
      try {
        await this.$store.dispatch('login', this.user)
        this.$router.push({name: 'dashboard',
          params: {first_login: true}})
      } catch(error) {
        console.log(error)
        window.alert("Sorry, something went wrong")
      }
    }
  }
}
</script>

<style scoped>
#account-form {
  width: 70%;
  margin: auto;
  margin-top: 3rem;
}

#button-container {
  margin-bottom: 2rem;
}
</style>