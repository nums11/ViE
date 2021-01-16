<template>
  <sui-modal v-model="show_modal">
    <sui-modal-header class="center-text">
      Forgot Password
    </sui-modal-header>
    <sui-modal-content class="center-text">
      <div id="loader-container" v-if="!emails_loaded">
        <sui-loader active size="medium" class="workaround">
          Loading...
        </sui-loader>
      </div>
      <div v-else>
        <p>
          Input the email for your account - you  will
          receive a link to reset your password.
        </p>
        <sui-form>
          <sui-form-field>
            <label class="form-label" id="email-label">
              Email
            </label>
            <input id="email-input" v-model="email"
            type="email">
            <sui-button id="send-btn"
              @click.prevent="sendPasswordResetEmail"
              :disabled="disableSendBtn"
              animated size="small"
              style="background-color:#00b80c; color:white;">
              <sui-button-content visible>
                Send
              </sui-button-content>
              <sui-button-content hidden>
                <sui-icon name="envelope open" />
              </sui-button-content>
            </sui-button>
          </sui-form-field>
          <p v-if="show_error" class="error">
            No account with this email found - Please
            make sure you entered the email correctly.
          </p>
        </sui-form>
      </div>
    </sui-modal-content>
  </sui-modal>
</template>

<script>
import AuthAPI from '@/services/AuthAPI'
import EmailAPI from '@/services/EmailAPI'

export default {
  name: 'ForgotPasswordModal',
  data () {
    return {
      show_modal: true,
      email: "",
      show_error: false,
      emails_loaded: false,
      non_rpi_emails: []
    }
  },
  computed: {
    disableSendBtn() {
      return this.email.length === 0 ||
      !this.email.includes('@') ||
      !this.email.includes('.')
    }
  },
  created () {
    this.getNonRPIEmails()
  },
  methods: {
    async getNonRPIEmails() {
      try {
        const response = await AuthAPI.getNonRPIUserIDsAndEmails()
        const data = response.data
        this.non_rpi_emails = data.emails
        this.emails_loaded = true
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong.")
      }
    },
    async sendPasswordResetEmail() {
      this.show_error = false
      if(!this.non_rpi_emails.includes(this.email)) {
        this.show_error = true
        return
      }

      try {
        this.emails_loaded = false
        const response = await EmailAPI.sendPasswordResetEmail(
          this.email)
        alert("Email Sent")
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong")
      }
      this.emails_loaded = true
      this.email = ""
    },
    showModal() {
      this.show_modal = true
    }
  }
}
</script>

<style scoped>
#email-label {
  margin-left: 3rem;
}

#email-input {
  width: 70%;
  margin-right: 1rem;
}

#loader-container {
  margin-top: 8rem;
}

/* Phones */
@media (max-width: 744px) {
  #email-label {
    margin-left: 0;
  }
  #email-input {
    width: 100%;
  }
  #send-btn {
    margin-top: 2rem;
  }
}
</style>