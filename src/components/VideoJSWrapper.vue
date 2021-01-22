<template>
  <div>
    <video
      id="videoPlayer"
      class="video-js vjs-big-play-centered video_video"
      controls
    ></video>
  </div>
</template>

<script>
import videojs from "video.js";

export default {
  name: "VideoJSWrapper",
  data() {
    return {
      video: {},
      video_has_loaded: false,
      submission: {},
      player: null,
    };
  },
  props: {
    options: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  async created() {},
  mounted() {
    console.log("Mount");
    console.log(this.options.sources);
    this.player = videojs("videoPlayer", this.options);
  },
  beforeDestroy() {
    if (this.player) {
      console.log("Dispose");
      this.player.dispose();
    }
  },
  computed: {},
  methods: {
    pause() {
      this.player.pause();
    },
  },
};
</script>

<style scoped>
.video_video {
  width: 100%;
  height: 80%;
}
</style>