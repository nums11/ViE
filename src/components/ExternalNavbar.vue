<template>
  <div id="external-navbar">
    <hide-at breakpoint="mediumAndBelow">
      <ExternalDesktopNavbar />
    </hide-at>
    <show-at breakpoint="mediumAndBelow">
      <ExternalMobileNavbar />
    </show-at>
  </div>
</template>

<script>
import Button from '@/components/Button'
import ExternalDesktopNavbar from '@/components/ExternalDesktopNavbar'
import ExternalMobileNavbar from '@/components/ExternalMobileNavbar'

export default {
  name: 'ExternalNavbar',
  components: {
    Button,
    ExternalDesktopNavbar,
    ExternalMobileNavbar
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
/deep/ .navbar {
  padding-bottom: 0.5rem;
  padding-top: 1rem;
  border-bottom: #dedede solid thin;
}

/deep/ #logo-container {
  display: inline-block;
  vertical-align: top;
  cursor: pointer;
}


/deep/ #logo {
  height: 3rem;
  display: inline-block;
  vertical-align: top;
}

/deep/ #app-name {
  display: inline-block;
  vertical-align: top;
  margin-left: 0.5rem;
  font-size: 2.5rem;
  color: #2c3e50;
  font-weight: 500;
  height: 3rem;
  padding-top: 1rem;
}
</style>