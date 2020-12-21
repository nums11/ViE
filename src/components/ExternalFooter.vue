<template>
  <div id="external-footer">
    <img src="@/assets/logo.svg" id="logo" />
    <div id="app-name">ViE</div>
  </div>
</template>

<script>

export default {
  name: 'ExternalFooter',
  components: {

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

<style scoped>
#external-footer {
  background-color: black;
  color: white;
  padding-top: 1rem;
  padding-bottom: 1rem;
  padding-left: 10rem;
  padding-right: 10rem;
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
  color: white;
  font-weight: 500;
  height: 3rem;
  padding-top: 1rem;
}
</style>