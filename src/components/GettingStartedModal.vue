<template>
  <sui-modal v-model="show_modal">
    <sui-modal-header class="center-text">
      Getting Started
    </sui-modal-header>
    <sui-modal-content scrolling class="center-text">
      <p>Watch this video to get started</p>
      <iframe v-if="is_instructor" id="getting-started-video" src="https://www.youtube.com/embed/LDn55wPsx3Y" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      <iframe v-else width="560" id="getting-started-video" height="315" src="https://www.youtube.com/embed/Q_P20sig254" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      <p class="mt-2">How to Schedule a Meeting</p>
      <!-- Add video below -->
    </sui-modal-content>
    <sui-modal-actions>
      <sui-button @click="hideModal"
      style="background-color:#00B3FF; color:white;">
        Done
      </sui-button>
    </sui-modal-actions>
    <div>{{ stopVideoWhenClosingModal }}</div>
  </sui-modal>
</template>

<script>
import videojs from "video.js"

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
    stopVideoWhenClosingModal() {
      if(this.show_modal === false) {
        const video = document.getElementById('getting-started-video')
        if(video != null){
          video.src = video.src
        }
      }
    }
  },
  created () {
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
#getting-started-video {
  width: 40rem;
  height: 20rem;

}

@media (max-width: 744px) {
  #getting-started-video {
    width: 90%;
  }
}
</style>