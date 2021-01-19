<template>
  <div id="settings" class="center-text">
    <h1>
      {{ state_user.first_name }} {{ state_user.last_name }}
    </h1>
    <p>Email: {{ state_user.email }}</p>
    <div class="mt-2">
      <sui-button @click="showEditUserModal" size="small" animated
      style="background-color:#00B3FF; color:white;">
          <sui-button-content visible>Edit</sui-button-content>
          <sui-button-content hidden>
              <sui-icon name="edit" />
          </sui-button-content>
      </sui-button>
    </div>
    <div class="mt-2">
      <sui-button @click="logOut" size="small" animated
      style="background-color:#FF0000; color:white;">
          <sui-button-content visible>Log out</sui-button-content>
          <sui-button-content hidden>
              <sui-icon name="arrow right" />
          </sui-button-content>
      </sui-button>
    </div>
    <EditUserModal ref="EditUserModal" />
  </div>
</template>

<script>
import EditUserModal from '@/components/EditUserModal'
import AuthAPI from '@/services/AuthAPI'

export default {
  name: 'Settings',
  computed: {
  },
  components: {
    EditUserModal
  },
  data(){
    return {
    }
  },
  created() {

  },
  methods: {
    async logOut() {
      try {
        await AuthAPI.logoutCAS()
        this.$store.dispatch('logout')
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong")
      }
    },
    showEditUserModal() {
      this.$refs.EditUserModal.showModal()
    }
  }
}
</script>

<style scoped>
#settings {
  margin-top: 3rem;
}
</style>
