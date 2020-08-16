<template>
  <div>
    <div class="spinner-border" role="status" v-if="!recording_has_loaded">
        <span class="sr-only">Loading...</span>
    </div>
    <video v-else id="video_player" class="video-js vjs-big-play-centered" controls>
      <source v-bind:src="recording.video_url" type="">
    </video>
  </div>
</template>

<script>
  import videojs from "video.js"
  import RecordingAPI from '@/services/RecordingAPI.js';

  export default {
    name: "WatchRecording",
    data() {
      return {
        recording: {},
        recording_has_loaded: false
      }
    },
    props: {

    },
    created() {
      this.recording_id = this.$route.params.recording_id
      this.getRecording()
    },
    computed: {
    },
    methods: {
      async getRecording() {
        const response = await RecordingAPI.getRecording(this.recording_id)
        this.recording = response.data
        this.recording_has_loaded = true
      }
    }
  };
</script>

<style scoped>

</style>