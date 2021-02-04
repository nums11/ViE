<template>
  <div id="video-container">
  </div>
</template>

<script>
import videojs from "video.js";
import markers from 'videojs-markers'
import 'videojs-markers/dist/videojs.markers.css'

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
    this.player.markers({
      markerStyle: {
        'background-color': '#00B3FF',
        'position': 'absolute',
        'margin-bottom': '-3px',
        'height': '10px'
      },
      markerTip: {
        text: function(marker) {
           return marker.text;
        },
      },
      markers: []
    })
    this.$emit('created-player',this.player)
    this.listenForArrowKeyPress()
  },
  beforeDestroy() {
    this.video_options.sources = []
    if (this.player) {
      this.player.dispose()
    }
    window.removeEventListener('keydown', this.handleKeyPress)
  },
  methods: {
    createVideoElement() {
      let video_container = document.getElementById('video-container')
      let video = document.createElement('video')
      video.classList.add('video-js')
      video.classList.add('vjs-big-play-centered')
      video.id = `video-player`
      video_container.appendChild(video)
    },
    addMarker(timestamp, question) {
      this.player.markers.add([{
        time: timestamp,
        text: question
      }])
    },
    addMarkers(questions) {
      questions.forEach(question => {
        this.addMarker(question.video_timestamp,
          question.question)
      })
    },
    removeMarker(index) {
      this.player.markers.remove([index])
    },
    listenForArrowKeyPress() {
      window.addEventListener('keydown', this.handleKeyPress)
    },
    handleKeyPress (e) {
      if(e.keyCode === 37)
       this.moveVideo5Seconds(false)
      else if(e.keyCode === 39)
       this.moveVideo5Seconds(true)
    },
    moveVideo5Seconds(forward) {
      let current_time = this.player.currentTime()
      if(forward) {
        current_time += 5
        const duration = this.player.duration()
        if(current_time > duration)
          current_time = duration
      } else {
        current_time -= 5
        if(current_time < 0)
          current_time = 0
      }
      this.player.currentTime(current_time)
    }
  }
}
</script>

<style scoped>
#video-player {
  width: 100%;
}
</style>