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
  import io from 'socket.io-client';

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
      this.handleSeedingDoneEvent()
    },
    methods: {
      handleSeedingDoneEvent() {
        let url = ""
        if(process.env.NODE_ENV === "production") {
          url = "https://byakugan.herokuapp.com/"
        } else {
          url = "http://localhost:4000/"
        }
        let client_io = io (url, {forceNew: true})
        client_io.on('seeding-done', () => {
          console.log("Seeding Done")
          this.seeding_done = true
        })
      },
      async initSeed(seed_size) {
        this.seeding_done = false
        let confirmation = confirm(`Are you sure you want to do a ${seed_size} seed?`)
        if(confirmation){
          console.log(`Doing a ${seed_size} seed`)
          await SeedAPI.seed(seed_size)
          console.log("Received response")
        }
      }
    }
  }
</script>

<style scoped>
</style>