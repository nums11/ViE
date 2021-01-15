<template>
  <div class="navbar" id="desktop-navbar">
    <div id="logo-container">
      <router-link :to="{path: '/'}">
        <img src="@/assets/logo.svg" id="logo" />
        <div id="app-name">ViE</div>
      </router-link>
    </div>
    <div id="nav-buttons-container">
      <!-- Add back -->
      <a class="nav-link" href="#what-is-vie"
      v-smooth-scroll="{duration: 3000}">
        What Is ViE
      </a>
      <a class="nav-link" href="#testimonials"
      v-smooth-scroll="{duration: 3000}">
        Testimonials
      </a>
<!--       <router-link class="nav-link" :to="{name: 'features'}">
        How it Works
      </router-link> -->
<!--       <router-link class="nav-link" :to="{name: 'blog'}">
        Testimonials
      </router-link> -->
    </div>
    <div id="login-signup-buttons-container">
      <router-link class="nav-link" :to="{name: 'login'}">
        Log in
      </router-link>
      <Button route_name="signup" text="Sign up" color="blue"
      size="small" />
    </div>
  </div>
</template>

<script>
import Button from '@/components/Button'

export default {
  name: 'ExternalDesktopNavbar',
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
#desktop-navbar {
  padding-left: 5rem;
  padding-right: 5rem;
}

#nav-buttons-container {
  display: inline-block;
  vertical-align: top;
  height: 3rem;
  margin-left: 35%;
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