<template>
  <div>
    <h1>Seed Buttons</h1>
    <button @click="initSeed('small')">Small Seed</button>
    <button @click="initSeed('medium')">Medium Seed</button>
    <button @click="initSeed('large')">Large Seed</button>
  </div>
</template>

<script>
  import SeedAPI from '@/services/SeedAPI'

  export default {
    name: 'SeedButtons',
    props: {
    },
    computed: {
    },
    components: {
    },
    data(){
      return {
      }
    },
    created() {

    },
    methods: {
      initSeed(seed_size) {
        let confirmation = confirm(`Are you sure you want to do a ${seed_size} seed?`)
        if(confirmation)
          SeedAPI.seed(seed_size)
      }
    }
  }
</script>

<style scoped>
</style>