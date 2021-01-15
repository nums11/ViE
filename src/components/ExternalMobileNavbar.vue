<template>
  <div class="navbar">
    <div id="mobile-navbar">
      <div id="logo-container">
        <router-link :to="{path: '/'}">
          <img src="@/assets/logo.svg" id="logo" />
          <div id="app-name">ViE</div>
        </router-link>
      </div>
      <div id="bar-icon-container">
        <sui-icon v-if="show_dropdown" @click="hideDropdown"
        name="bars" size="big" class="menu-icon" rotated="clockwise" />
        <sui-icon v-else @click="showDropdown"
        name="bars" size="big" class="menu-icon" />
      </div>
    </div>
    <div id="nav-links-dropdown-container">
      <div id="nav-links-dropdown">
<!--         <router-link class="nav-link" :to="{name: 'features'}">
          Features
        </router-link>
        <router-link class="nav-link" :to="{name: 'blog'}">
          Blog
        </router-link> -->
        <router-link class="nav-link" :to="{name: 'login'}">
          Log in
        </router-link>
        <router-link class="nav-link" :to="{name: 'login'}">
          Sign up
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'ExternalMobileNavbar',
  components: {
  },
  data(){
    return {
      show_dropdown: false
    }
  },
  created() {

  },
  methods: {
    showDropdown() {
      let drop_down = document.getElementById("nav-links-dropdown")
      this.show_dropdown = true
      drop_down.style.maxHeight = "10rem"
    },
    hideDropdown() {
      let drop_down = document.getElementById("nav-links-dropdown")
      this.show_dropdown = false
      drop_down.style.maxHeight = "0"
    },
  }
}
</script>

<style scoped>
#mobile-navbar {
  padding-left: 3rem;
  padding-right: 3rem;
}

#bar-icon-container {
  display: inline-block;
  vertical-align: bottom;
  height: 3rem;
  padding-top: 0.5rem;
  float: right;
}

.menu-icon {
  cursor: pointer;
}

#nav-links-dropdown-container {
  max-height: 10rem;
  -webkit-transition: max-height 2s linear;
  -ms-transition: max-height 2s linear;
  transition: max-height 2s linear;
}

#nav-links-dropdown {
  text-align: center;
  margin-top: 0.25rem;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.15s linear;
}

.nav-link {
  display: block;
  margin-top: 0.75rem;
  color: black;
  font-weight: bold;
}

/* Phones */
@media (max-width: 744px) {
  #mobile-navbar {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}
</style>