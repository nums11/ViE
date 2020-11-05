<template>
  <div>
    <h2>Users With Updated Auth Headers</h2>
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
              </tr>
          </tbody>
      </table>
  </div>
</template>

<script>
  import AuthAPI from '@/services/AuthAPI.js';

  export default {
    name: "AdminUpdatedAuthHeaders",
    data(){
      return {
        users: [],
      }
    },
    created() {
      this.getUsersWithUpdatedAuthHeaders();
    },
    methods: {
      async getUsersWithUpdatedAuthHeaders () {
        const response = await AuthAPI.getUsersWithUpdatedAuthHeaders();
        this.users = response.data;
      }
    }
  }
</script>