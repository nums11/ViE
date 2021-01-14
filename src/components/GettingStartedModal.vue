<template>
  <sui-modal v-model="show_modal">
    <sui-modal-header class="center-text">
      Getting Started
    </sui-modal-header>
    <sui-modal-content scrolling class="center-text">
<!--       <video id="video_player" controls>
        <source src="https://www.youtube.com/watch?v=m0ysryefnLI">
      </video> -->
      <iframe width="560" height="315" src="https://www.youtube.com/embed/m0ysryefnLI" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </sui-modal-content>
    <sui-modal-actions>
      <sui-button @click="hideModal"
      style="background-color:#00B3FF; color:white;">
        Done
      </sui-button>
    </sui-modal-actions>
  </sui-modal>
</template>

<script>
export default {
  name: 'GettingStartedModal',
  props: {
  },
  components: {

  },
  data () {
    return {
      show_modal: false,
    }
  },
  computed: {
  },
  created () {
  },
  mounted () {
  },
  methods: {
    showModal() {
      this.show_modal = true
    },
    hideModal() {
      this.show_modal = false
    },
  }
}
</script>

<style scoped>
</style>