<template>
  <div id="video-container">
  </div>
</template>

<script>
import videojs from "video.js";

export default {
  name: 'VideoPreview',
  props: {
    video_source: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      video: {},
      video_has_loaded: false,
      submission: {},
      player: null,
      video_options: {
        autoplay: false,
        controls: true,
        fluid: true,
        sources: [],
      },
    }
  },
  computed: {

  },
  created () {
    this.video_options.sources.push(this.video_source)
  },
  mounted() {
    this.createVideoElement()
    this.player = videojs(`video-player`, this.video_options)
  },
  beforeDestroy() {
    this.video_options.sources = []
    if (this.player) {
      this.player.dispose()
    }
  },
  methods: {
    createVideoElement() {
      let video_container = document.getElementById('video-container')
      let video = document.createElement('video')
      video.classList.add('video-js')
      video.classList.add('vjs-big-play-centered')
      video.id = `video-player`
      video_container.appendChild(video)
    }
  }
}
</script>

<style scoped>
#video-player {
  width: 100%;
}
</style>