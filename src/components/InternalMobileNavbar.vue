<template>
  <div id="internal-mobile-navbar">
    <div id="logo-container">
      <router-link :to="{name: 'dashboard'}">
        <img src="@/assets/logo.svg" id="logo" />
        <div id="app-name">ViE</div>
      </router-link>
    </div>

    <sui-icon name="bars" size="big" id="menu-bars"
    @click="$emit('show-mobile-nav-slider')" />
    <sui-icon @click="showGettingStartedModal"
    name="question circle outline" size="large" id="question"
    slot="trigger"/>
    <GettingStartedModal ref="GettingStartedModal" />
  </div>
</template>

<script>
import GettingStartedModal from
'@/components/GettingStartedModal'

export default {
  name: 'InternalMobileNavBar',
  components: {
    GettingStartedModal
  },
  data(){
    return {

    }
  },
  created() {
  },
  mounted() {

  },
  methods: {
    showGettingStartedModal() {
      this.$refs.GettingStartedModal.showModal()
    }
  }
}
</script>

<style scoped>
#internal-mobile-navbar {
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.5rem;
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
  font-size: 2.5rem;
  color: #2c3e50;
  font-weight: 500;
  height: 3rem;
  padding-top: 1rem;
}

#menu-bars {
  float: right;
  margin-top: 0.5rem;
  cursor: pointer;
}

#question {
  float: right;
  margin-top: 0.75rem;
  margin-right: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  #internal-mobile-navbar {
    padding-top: 1rem;
    padding-left: 2rem;
    padding-right: 3rem;
  }
}
</style>