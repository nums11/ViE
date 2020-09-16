<template>
  <div>
    <h2>Edit Organization</h2>
    <router-link :to="{name: 'org_new_meeting', params: { org_id: org._id }}" tabindex="-1">
      <button class="inline-block"tabindex="0">Create New Meeting for {{ org.name }}</button>
    </router-link>
    <router-link :to="{name: 'org_info', params: { id: org._id }}" tabindex="-1">
      <button class="inline-block"tabindex="0">Go to Org Info for {{ org.name }}</button>
    </router-link>
    <form @submit.prevent="updateOrg">
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label>name</label>
            <input type="text" class="form-control" v-model="org.name">
          </div>
        </div>
      </div>
      <div class="form-group">
        <button class="btn btn-primary">Update</button>
      </div>
    </form>

    <!-- Existing board members -->
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

    <!-- Existing General Members -->
    <h4>General Members</h4>
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
            <tr v-for="general_member in general_members" :key="general_member._id">
              <td>{{ general_member.first_name }}</td>
              <td>{{ general_member.last_name }}</td>
              <td>{{ general_member.is_instructor }}</td>
              <td>{{ general_member.is_ta }}</td>
              <td><button class="btn btn-danger" @click.prevent="removeGeneralMember(general_member)">Remove</button></td>
            </tr>
        </tbody>
    </table>

    <!-- Add Board Members -->
    <h4>Add board members</h4>
    <AdminUsers v-on:select-user="addBoardMember" />

    <!-- Add General Members -->
    <h4>Add general members</h4>
    <AdminUsers v-on:select-user="addGeneralMember"/>
  </div>
</template>

<script>
  import OrgAPI from '@/services/OrgAPI.js';
  import UserAPI from '@/services/UserAPI.js';
  import AdminUsers from '@/components/admin/User/AdminUsers'

  export default {
    name: 'EditOrg',
    components: {
      AdminUsers
    },
    data() {
      return {
        org: {},
        board_members: [],
        general_members: []
      }
    },
    created() {
      this.org_id = this.$route.params.id
      this.getOrg()
    },
    methods: {
      async getOrg() {
        const response = await OrgAPI.getOrg(this.org_id)
        this.org = response.data
        this.board_members = this.org.board_members
        this.general_members = this.org.general_members
      },
      async updateOrg() {
        const response = await OrgAPI.updateOrg(this.org_id, this.org)
        this.$router.go()
      }, 
      async addBoardMember(user){
        if(this.isBoardMember(user)) {
          alert("User is already a board member")
          return
        } else if(this.isGeneralMember(user)) {
          await OrgAPI.addBoardMemberToOrg(this.org_id, user._id, true)
          this.$router.go()
        } else {
          await OrgAPI.addBoardMemberToOrg(this.org_id, user._id, false)
          this.$router.go()
        }
      },
      async addGeneralMember(user){
        if(this.isGeneralMember(user)) {
          alert("User is already a general member")
          return
        } else if(this.isBoardMember(user)) {
          await OrgAPI.addGeneralMemberToOrg(this.org_id, user._id, true)
          this.$router.go()
        } else {
          await OrgAPI.addGeneralMemberToOrg(this.org_id, user._id, false)
          this.$router.go()
        }
      },
      async removeBoardMember(user) {
        await OrgAPI.removeMemberFromOrg(this.org_id, user._id, true)
        this.$router.go()
      },
      async removeGeneralMember(user) {
        await OrgAPI.removeMemberFromOrg(this.org_id, user._id, false)
        this.$router.go()
      },
      isBoardMember(user) {
        let user_in_board = false
        this.board_members.forEach(board_member => {
          if(user._id == board_member._id)
            user_in_board = true
        })
        return user_in_board
      },
      isGeneralMember(user) {
        let user_in_general = false
        this.general_members.forEach(general_member => {
          if(user._id == general_member._id)
            user_in_general = true
        })
        return user_in_general
      }
    }
  }
</script>