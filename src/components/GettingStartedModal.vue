<template>
  <sui-modal v-model="show_modal">
    <sui-modal-header class="center-text">
      Getting Started
    </sui-modal-header>
    <sui-modal-content scrolling class="center-text">
      <p>Watch this video to get started</p>
      <iframe v-if="is_instructor" id="video-1" class="getting-started-video" src="https://www.youtube.com/embed/LDn55wPsx3Y" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      <iframe v-else width="560" height="315" src="https://www.youtube.com/embed/Q_P20sig254" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      <div v-if="is_instructor" class="mt-2">
        <p class="mt-2">How to Schedule a Meeting</p>
        <iframe id="video-2" class="getting-started-video" src="https://www.youtube.com/embed/U1HL8NcotI0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        <p class="mt-2">How to Conduct Real-Time Quizzes</p>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/ykBW_46nV58" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
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
        let video1 = document.getElementById('video-1')
        let video2 = document.getElementById('video-2')
        if(video1 != null){
          video1.src = video1.src
        }
        if(video2 != null){
          video2.src = video2.src
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
.getting-started-video {
  width: 40rem;
  height: 20rem;

}

@media (max-width: 744px) {
  .getting-started-video {
    width: 90%;
  }
}
</style>