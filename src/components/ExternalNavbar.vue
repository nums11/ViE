<template>
  <div id="external-navbar">
    <div id="logo-container">
      <router-link :to="{path: '/'}">
        <img src="@/assets/logo.svg" id="logo" />
        <div id="app-name">ViE</div>
      </router-link>
    </div>
    <div id="nav-buttons-container">
      <router-link class="nav-link" :to="{name: 'features'}">
        Features
      </router-link>
      <router-link class="nav-link" :to="{name: 'blog'}">
        Blog
      </router-link>
    </div>
    <div id="login-signup-buttons-container">
      <router-link class="nav-link" :to="{name: 'login'}">
        Log in
      </router-link>
      <Button text="Sign up" color="blue" size="small" />
    </div>
  </div>
</template>

<script>
import Button from '@/components/Button'

export default {
  name: 'ExternalNavbar',
  components: {
    Button
  },
  data(){
    return {
    }
  },
  created() {

  },
  methods: {

  }
}
</script>

<style lang="css" scoped>
#external-navbar {
  padding-left: 5rem;
  padding-right: 5rem;
  padding-bottom: 0.5rem;
  padding-top: 1rem;
  border-bottom: #dedede solid thin;
}

#logo-container {
  display: inline-block;
  vertical-align: top;
  cursor: pointer;
}

#logo {
  height: 3rem;
  display: inline-block;
  vertical-align: top;
}

#app-name {
  display: inline-block;
  vertical-align: top;
  margin-left: 0.5rem;
  font-size: 2.5rem;
  /*font-family: Exo;*/
  color: #2c3e50;
  font-weight: 500;
  height: 3rem;
  padding-top: 1rem;
}

#nav-buttons-container {
  display: inline-block;
  vertical-align: top;
  height: 3rem;
  margin-left: 37.5%;
  padding-top: 1rem;
}

.nav-link {
  display: inline-block;
  font-size: 1.25rem;
  cursor: pointer;
  color: black;
  /*font-weight: bold;*/
}

.nav-link:first-child {
  margin-right: 2rem;
}

#login-signup-buttons-container {
  display: inline-block;
  vertical-align: top;
  height: 3rem;
  padding-top:0.7rem;
  float: right;
}

</style>