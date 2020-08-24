<template>
  <div>
    <h2>Organizations</h2>
      <table class="table table-hover">
          <thead>
          <tr>
            <th>name</th>
            <th># board members</th>
            <th># general members</th>
          </tr>
          </thead>
          <tbody>
              <tr v-for="org in orgs" :key="org._id">
                <td>{{ org.name }}</td>
                <td>{{ org.board_members.length }}</td>
                <td>{{ org.general_members.length }}</td>
                <div v-if="is_orgs_view">
                  <td><router-link :to="{name: 'admin_edit_org', params: { id: org._id }}" class="btn btn-primary">Edit</router-link></td>
                  <td><button class="btn btn-danger" @click.prevent="deleteOrg(org._id)">Delete</button></td>
                </div>
                <div v-else>
                  <td><button class="btn btn-secondary" @click.prevent="$emit('select-org', org)">Select</button></td>
                </div>
              </tr>
          </tbody>
      </table>
  </div>
</template>

<script>
  import OrgAPI from '@/services/OrgAPI.js';

  export default {
    data(){
      return {
        org:{},
        orgs: [],
        is_orgs_view: false
      }
    },
    created() {
      this.is_orgs_view = this.$route.name === "admin_orgs"
      this.loadOrgs();
    },
    methods: {
      async loadOrgs () {
        const response = await OrgAPI.getOrgs();
        this.orgs = response.data;
      },
      async deleteOrg(id){
        const response = await OrgAPI.deleteOrg(id);
        this.orgs.splice(this.orgs.findIndex(i => i._id == id), 1);
      },
      logout () {
        this.$store.dispatch('logout')
          .then(() => this.$router.push({name: 'dashboard'}))
      }
    }
  }
</script>