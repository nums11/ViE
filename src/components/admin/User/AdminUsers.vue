<template>
  <div id="admin-users">
    <h2 v-if="is_users_view">Users ({{ users.length }})</h2>
    <sui-table>
      <sui-table-header>
        <sui-table-row>
          <sui-table-header-cell>First Name</sui-table-header-cell>
          <sui-table-header-cell>Last Name</sui-table-header-cell>
          <sui-table-header-cell>Is Instructor</sui-table-header-cell>
          <sui-table-header-cell>User ID</sui-table-header-cell>
          <sui-table-header-cell>Email</sui-table-header-cell>
          <sui-table-header-cell>Is RPI Member</sui-table-header-cell>
          <sui-table-header-cell># Instructor Courses</sui-table-header-cell>
          <sui-table-header-cell># Student Sections</sui-table-header-cell>
          <sui-table-header-cell>View User</sui-table-header-cell>
        </sui-table-row>
      </sui-table-header>
      <sui-table-body>
        <sui-table-row v-for="user in users">
          <sui-table-cell>{{ user.first_name }}</sui-table-cell>
          <sui-table-cell>{{ user.last_name }}</sui-table-cell>
          <sui-table-cell>{{ user.is_instructor }}</sui-table-cell>
          <sui-table-cell>{{ user.user_id }}</sui-table-cell>
          <sui-table-cell>{{ user.email }}</sui-table-cell>
          <sui-table-cell>{{ user.is_rpi_member }}</sui-table-cell>
          <sui-table-cell>
            {{ user.instructor_courses.length }}
          </sui-table-cell>
          <sui-table-cell>
            {{ user.student_sections.length }}
          </sui-table-cell>
          <sui-table-cell>
            <router-link :to="{name: 'admin_edit_user',
            params: {id: user._id}}">
              <sui-button color="blue">View User</sui-button>
            </router-link>
          </sui-table-cell>
        </sui-table-row>
      </sui-table-body>
    </sui-table>
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

<style>
  #admin-users {
    width: 80%;
    margin: auto;
    margin-top: 2rem;
  }
</style>