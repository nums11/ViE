<template>
  <div>
    <h1 class="form-header">Finish creating your account</h1>
    <sui-form class="form">
      <div class="form-field">
        <sui-form-field>
          <label class="form-label">User Id</label>
          <input v-model="user.user_id" readonly>
        </sui-form-field>
      </div>
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
      <div v-if="!inviting_student" class="form-field">
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
      },
      first_name_input_clicked: false,
      last_name_input_clicked: false,
      inviting_student: false
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
    formComplete() {
      return this.user.first_name !== "" &&
        this.user.last_name !== "" &&
        this.user.user_id !== ""
    }
  },
  created () {
    this.getIDsFromRoute()
  },
  methods: {
    setFirstNameInputClicked() {
      this.first_name_input_clicked = true
    },
    setLastNameInputClicked() {
      this.last_name_input_clicked = true
    },
    async onboardUser() {
      if(this.formComplete) {
        try {
          await AuthAPI.onboardUser(this.user, this.section_id, this.invite_code);
          window.location.href = process.env.NODE_ENV === 'production' ?
          "https://cas-auth.rpi.edu/cas/login?service=https%3A%2F%2Fviengage.com%2Fauth%2FloginCAS%-null-null":
          "https://cas-auth.rpi.edu/cas/login?service=http%3A%2F%2Flocalhost%3A4000%2Fauth%2FloginCAS-null-null"
        } catch(error) {
          alert("Something went wrong. Please try again.")
          console.log("Error creating user", error)
        }
      }
    },
    getIDsFromRoute() {
      this.user.user_id = this.$route.params.user_id
      this.section_id = this.$route.params.optional_invited_section_id
      this.invite_code = this.$route.params.optional_invite_code
      if(this.section_id !== "null" && this.invite_code !== "null")
        this.inviting_student = true
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