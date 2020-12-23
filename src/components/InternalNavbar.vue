<template>
  <div id="internal-navbar">
    <div id="logo-container">
      <router-link :to="{name: 'dashboard'}">
        <img src="@/assets/logo.svg" id="logo" />
        <div id="app-name">ViE</div>
      </router-link>
    </div>
    <div id="nav-buttons-container">
      <router-link class="nav-link active-link" :to="{name: 'dashboard'}">
        Dashboard
      </router-link>
      <p class="nav-link" id="courses-link">
        <sui-dropdown text="Courses" floating>
            <sui-dropdown-menu id="dropdown-menu-container">
              <sui-dropdown-item>RCOS</sui-dropdown-item>
              <sui-dropdown-item>Data Structures</sui-dropdown-item>
            </sui-dropdown-menu>
        </sui-dropdown>
      </p>
    </div>
    <div id="right-side">
      <sui-popup content="Get help" position="bottom center" inverted>
        <sui-icon name="question circle outline" size="large" id="question"
        slot="trigger"/>
      </sui-popup>
      <!-- <sui-button id="user-name" :content="`${current_user.first_name} ${current_user.last_name}`" /> -->
      <sui-dropdown button
      :text="`${current_user.first_name} ${current_user.last_name}`"
      id="user-name" floating icon="null">
        <sui-dropdown-menu>
          <sui-dropdown-item>Join Course</sui-dropdown-item>
          <sui-dropdown-item>Settings</sui-dropdown-item>
          <sui-dropdown-item>Log out</sui-dropdown-item>
        </sui-dropdown-menu>
      </sui-dropdown>
    </div>
  </div>
</template>

<script>
import {showAt, hideAt} from 'vue-breakpoints'
import UserAPI from '@/services/UserAPI.js';

export default {
  name: 'InternalNavBar',
  computed: {
  },
  components: {
    hideAt,
    showAt
  },
  data(){
    return {

    }
  },
  created() {
    this.current_user = this.$store.state.user.current_user
  },
  methods: {
  }
}
</script>

<style scoped>
#internal-navbar {
  padding-left: 3rem;
  padding-right: 3rem;
  padding-top: 1rem;
  margin-bottom: 3rem;
}

#logo-container {
  display: inline-block;
  vertical-align: top;
  cursor: pointer;
}

#logo {
  height: 2.75rem;
  display: inline-block;
  vertical-align: top;
}

#app-name {
  display: inline-block;
  vertical-align: top;
  margin-left: 0.5rem;
  font-size: 2.25rem;
  color: #2c3e50;
  font-weight: 500;
  height: 3rem;
  padding-top: 1rem;
}

#nav-buttons-container {
  display: inline-block;
  vertical-align: top;
  height: 3rem;
  width: 33%;
  /*margin-left: 37.5%;*/
  /*padding-top: 1rem;*/
}

.nav-link {
  display: inline-block;
  font-size: 1.25rem;
  cursor: pointer;
  color: black;
  margin-left: 3rem;
  vertical-align: bottom;
/*  color: black;*/
  color: #2c3e50;
  /*font-weight: bold;*/
  /*font-weight: bold;*/
  /*border: black solid;*/
  padding-top: 1rem;
  height: 3rem;
  width: 30%;
  text-align: center;
}

#courses-link {
  padding-top: 0.8rem;
}

.active-link {
  border-bottom: black solid;
  font-weight: bold;
}

#dropdown-menu-container {
  margin-left: -1.5rem;
}

#right-side {
  float: right;
}

#question {
  /*vertical-align: bottom;*/
  cursor: pointer;
}

#user-name {
  margin-top: 0.5rem;
  background-color: #e83e8c;
  color: white;
  margin-left: 1rem;
  padding-right: 0;
}

</style>