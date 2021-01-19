<template>
  <sui-modal v-model="show_modal">
    <sui-modal-header class="center-text">
      Getting Started
    </sui-modal-header>
    <sui-modal-content scrolling class="center-text">
      <video id="getting-started-video" controls>
        <source :src="src">
      </video>
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
      src: ""
    }
  },
  computed: {
  },
  created () {
    this.setVideoSrc()
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
    setVideoSrc() {
      if(this.is_instructor)
        this.src = "https://storage.googleapis.com/venue_videos/ViE%20Instructors%20-%20Getting%20Started.mp4"
      else
        this.src = "https://storage.googleapis.com/venue_videos/ViE%20%20Students%20-%20Getting%20Started.mp4"

    }
  }
}
</script>

<style scoped>
#getting-started-video {
  width: 90%;
}
</style>