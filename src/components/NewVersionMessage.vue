<template>
  <div id="new-version-message">
    <h2>A new version of the application exists. Please reload the page</h2>
    <button @click="reloadPage">Reload</button>
  </div>
</template>

<script>
export default {
  name: 'NewVersionMessage',
  data() {
    return {

    }
  },
  created() {

  },
  methods: {
    reloadPage() {
      this.$router.go()
    }
  }
}
</script>

<style lang="scss" scoped>
#new-version-message {
  background-color: #32363d;
  position: fixed;
  text-align: center;
  bottom: 0;
  left: 0;
  width: 100%;
  padding-left: 1rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  color: white;

  h2 {
    display: inline-block;
    font-weight: bold;
  }

  button {
    border: #47C4FC solid;
    background-color: #47C4FC;
    border-radius: 2px;
    display: inline-block;
    margin-left: 1rem;
    font-weight: bold;
    font-size: 1.25rem;
    cursor: pointer;
  }
}
</style>
