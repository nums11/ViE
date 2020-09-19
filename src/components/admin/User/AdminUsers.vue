<template>
  <div>
    <h2 v-if="is_users_view">Users</h2>
      <table class="table table-hover">
          <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>is_instructor</th>
            <th>user_id</th>
          </tr>
          </thead>
          <tbody>
              <tr v-for="user in users" :key="user._id">
                <td>{{ user.first_name }}</td>
                <td>{{ user.last_name }}</td>
                <td>{{ user.is_instructor }}</td>
                <td>{{ user.user_id }}</td>
                <div v-if="is_users_view">
                  <td><router-link :to="{name: 'admin_edit_user', params: { id: user._id }}" class="btn btn-primary">Edit</router-link></td>
                  <td><button class="btn btn-danger" @click.prevent="deleteUser(user._id)">Delete</button></td>
                </div>
                <div v-else>
                  <td><button class="btn btn-secondary" @click.prevent="$emit('select-user', user)">Select</button></td>
                </div>
              </tr>
          </tbody>
      </table>
  </div>
</template>

<script>
  import UserAPI from '@/services/UserAPI.js';

  export default {
    name: "AdminUsers",
    data(){
      return {
        user:{},
        users: [],
        is_users_view: false
      }
    },
    created() {
      this.is_users_view = this.$route.name === "admin_users"
      this.loadUsers();
    },
    methods: {
      async loadUsers () {
        const response = await UserAPI.getUsers();
        this.users = response.data;
      },
      async deleteUser(id){
        let confirmation = confirm("Are you sure you want to delete this user?")
        if(confirmation){
          const response = await UserAPI.deleteUser(id);
          this.users.splice(this.users.findIndex(i => i._id == id), 1);
        }
      },
      logout () {
        this.$store.dispatch('logout')
          .then(() => this.$router.push({name: 'dashboard'}))
      }
    }
  }
</script>