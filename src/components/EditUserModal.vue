<template>
  <sui-modal v-model="show_modal">
    <sui-modal-header class="center-text">
      Edit
    </sui-modal-header>
    <sui-modal-content class="center-text" id="main-content">
      <div v-if="updating" id="loader-container">
        <sui-loader size="medium"
        class="workaround" inline>
          Updating
        </sui-loader>
      </div>
      <sui-form v-else id="edit-user-form"
      @submit.prevent="updateUser">
        <sui-form-field>
          <label class="form-label">First Name</label>
          <input class="invite-input" v-model="first_name">
        </sui-form-field>
        <sui-form-field>
          <label class="form-label">Last Name</label>
          <input class="invite-input" v-model="last_name">
        </sui-form-field>
        <sui-button
          :disabled="disableUpdateBtn"
          animated size="small"
          style="background-color:#00b80c; color:white;">
          <sui-button-content visible>
            Update
          </sui-button-content>
          <sui-button-content hidden>
            <sui-icon name="sync" />
          </sui-button-content>
        </sui-button>
      </sui-form>
    </sui-modal-content>
  </sui-modal>
</template>

<script>
import UserAPI from '@/services/UserAPI'

export default {
  name: 'EditUserModal',
  components: {

  },
  data () {
    return {
      show_modal: true,
      first_name: "",
      last_name: "",
      updating: false
    }
  },
  computed: {
    disableUpdateBtn() {
      return this.first_name === "" ||
      this.last_name === "" ||
      (this.first_name === this.state_user.first_name &&
        this.last_name === this.state_user.last_name)
    }
  },
  created () {
    this.first_name = this.state_user.first_name
    this.last_name = this.state_user.last_name
    console.log("local_storage", this.$store.state.user)

  },
  mounted () {
  },
  methods: {
    async updateUser() {
      try {
        const response = await UserAPI.updateUserName(
          this.state_user._id, this.first_name, this.last_name)
        const updated_user = response.data
        console.log("Updated", updated_user)
        let local_storage = this.$store.state.user
        local_storage.current_user = updated_user
        await this.$store.commit('SET_USER_DATA', local_storage)
        this.$router.go()
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong")
      }
    },
    showModal() {
      this.show_modal = true
    }
  }
}
</script>

<style scoped>
#main-content {
  padding-top: 0;
}

#edit-user-form {
  width: 50%;
}

/* Phones */
@media (max-width: 744px) {
  #edit-user-form {
    width: 90%;
  }
}
</style>