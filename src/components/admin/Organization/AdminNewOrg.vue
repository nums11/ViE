<template>
  <div>
    <h2>Create an Organization</h2>
    <form @submit.prevent="addOrg">
        <div class="col-md-6">
          <label>name:</label>
          <input type="text" class="form-control" v-model="org.name">
        </div>
        <div class="form-group">
          <button class="btn btn-primary">Create</button>
        </div>
    </form>

    <h4>Board Members</h4>
    <table class="table table-hover">
        <thead>
        <tr>
          <th>First Name</th>
          <th>Last Name</th>
          <th>is_instructor</th>
          <th>is_ta</th>
        </tr>
        </thead>
        <tbody>
            <tr v-for="board_member in board_members" :key="board_member._id">
              <td>{{ board_member.first_name }}</td>
              <td>{{ board_member.last_name }}</td>
              <td>{{ board_member.is_instructor }}</td>
              <td>{{ board_member.is_ta }}</td>
              <td><button class="btn btn-danger" @click.prevent="removeBoardMember(board_member)">Remove</button></td>
            </tr>
        </tbody>
    </table>

    <h4 style="margin-top:2rem;">Add Board Members</h4>
    <AdminUsers v-on:select-user="addBoardMember" />

  </div>
</template>

<script>
  import OrgAPI from '@/services/OrgAPI.js';
  import AdminUsers from '@/components/admin/User/AdminUsers';

  export default {
    name: 'Course',
    components: {
      AdminUsers
    },
    data(){
      return {
        org: {},
        board_members: []
      }
    },
    created() {
    },
    methods: {
      async addOrg(){
        this.org.board_members = this.board_members
        const response = await OrgAPI.addOrg(this.org);
        this.$router.push({name: 'admin_orgs'});
      },
      addBoardMember(user) {
        let user_in_board = false
        this.board_members.forEach(board_member => {
          if(user._id == board_member._id)
            user_in_board = true
        })
        if(!user_in_board)
          this.board_members.push(user)
      },
      removeBoardMember(user) {
        this.board_members.splice(this.board_members.indexOf(user),1)
      }
    }
  }
</script>courses