<template>
  
  <!-- If the user's account was not set up completely when attempting to Accept Invite,
  this is where they will be able finish their account setup -->
  <div class="finish-account-creation">

    <CenteredModule>
      <h3>Finish Account Setup</h3>
      <p>You must finish setting up your Venue account before you can proceed.</p>

      <div class="field-area">
        <div class="left">email</div>
        <div class="right">sampleemail@gmail.com</div>
      </div>
      <div :style="{marginTop: '30px'}">
        <h4>Set You Password</h4>
        <div :style="{marginBottom: '10px'}">
          <InputField2
            :validate="{
              mustMatch: (x) => [passwordLengthValid(), 'Password must be at least 5 characters']
            }"
            v-model="password"
            :config="{
              width: '100%',
              label: 'New Password',
              type: 'password'
            }"
          />
        </div>
        <div :style="{marginBottom: '10px'}">
          <InputField2
            :validate="{
              mustMatch: (x) => [passwordsMatch(), 'Passwords must match.']
            }"
            v-model="confirm_password" 
            :config="{
              width: '100%',
              label: 'Confirm Password',
              type: 'password'
            }"
          />
        </div>
      </div>
      <div :style="{marginTop: '20px'}">
        <Button2 
          text="Complete Account Setup"
          :valid="passwordsMatch() && passwordLengthValid()"
          :disabled="!passwordsMatch() || !passwordLengthValid()"
          :onClick="finishAccountSetup"
          :config="{
            width: '100%'
          }"
        />
      </div>
    </CenteredModule>

  </div>

</template>
<script>
import AuthAPI from "@/services/AuthAPI"
import CenteredModule from "@/components/CenteredModule"
import InputField2 from "@/components/InputField2"
import Button2 from "@/components/Button2"
export default {
  name: "FinishAccountCreation",
  components: {
    CenteredModule,
    InputField2,
    Button2
  },
  data () {
    return {
      password: "",
      confirm_password: ""
    }
  },
  methods: {
    redirect () {

      // check query params if there is a redirect,
      // otherwise, redirect to login
      let query = this.$router.currentRoute.query
      // console.log(`Has redirect? ${Object.prototype.hasOwnProperty.call(query, 'redirect')}`)
      // console.log(query)
      if ( Object.prototype.hasOwnProperty.call(query, 'redirect') ) {
        this.$router.push( query.redirect )
      }
      else {
        this.$router.push( {name: 'dashboard'} )
      }

    },
    finishAccountSetup () {

      // Set the user's password
      let user_id = this.$router.currentRoute.params.user_id
      let confirm_key = this.$router.currentRoute.params.confirm_key
      AuthAPI.setPassword(user_id, this.password, confirm_key)
      .then(res => {
        console.log(`Set password result..`)
        console.log(res)

        // Silently log them in
        this.$store.dispatch('silentLogin', {
          _id: user_id,
          password: this.password
        })
        .then(res => {
          this.redirect ()
        })
        .catch(err => {
          console.log(err)
        })
        // this.redirect ()
      })
      .catch(err => {
        console.log(err)
      })
    },
    passwordsMatch () {
      return this.password == this.confirm_password
    },
    passwordLengthValid () {
      return this.password.length > 5
    }
  }
}
</script>
<style lang="scss">

.finish-account-creation {
  .field-area {
    display: flex;
    align-items: center;

    .left {
      margin-right: 10px;
      font-weight: 600
    }
  }
}

</style>