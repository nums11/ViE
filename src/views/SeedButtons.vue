<template>
  <div>
    <h1>Seed Buttons</h1>
    <button @click="initSeed('small')" id="small-seed">Small Seed</button>
    <button @click="initSeed('medium')" id="medium-seed">Medium Seed</button>
    <button @click="initSeed('large')" id="large-seed">Large Seed</button>
    <div v-if="seeding_done" id="#seeding-done">Seeding done</div>
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
        seeding_done: false
      }
    },
    created() {

    },
    methods: {
      async initSeed(seed_size) {
        this.seeding_done = false
        let confirmation = confirm(`Are you sure you want to do a ${seed_size} seed?`)
        if(confirmation){
          console.log(`Doing a ${seed_size} seed`)
          await SeedAPI.seed(seed_size)
          this.seeding_done = true
        }
      }
    }
  }
</script>

<style scoped>
</style>