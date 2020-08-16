<template>
  <div>
    <div class="spinner-border" role="status" v-if="!recording_has_loaded">
        <span class="sr-only">Loading...</span>
    </div>
    <video v-else id="video_player" class="video-js vjs-big-play-centered recording_video" data-setup='{"fluid": true}' controls>
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
      this.current_user = this.$store.state.user.current_user
      this.is_instructor = this.current_user.is_instructor
      this.getRecording()
    },
    computed: {
    },
    methods: {
      async getRecording() {
        const response = await RecordingAPI.getRecording(this.recording_id)
        this.recording = response.data
        this.recording_has_loaded = true
        if(!this.is_instructor)
          this.checkForSeeking()
      },
      checkForSeeking() {
        this.$nextTick(() => {
          videojs("video_player").ready(function() {
            let video_player = this
            let current_time = 0 //set initial time to 0
            video_player.on("seeking", (event) => {
              if (current_time < video_player.currentTime())
                video_player.currentTime(current_time);
            });
            video_player.on("seeked", (event) => {
              if (current_time < video_player.currentTime())
                video_player.currentTime(current_time);
            });
            // Update the current time once a second
            setInterval(function() {
              if (!video_player.paused())
                current_time = video_player.currentTime();
            }, 1000);
          })
        })
      }
    }
  };
</script>

<style scoped>
.recording_video {
  width: 100%;
  height: 80%;
}
</style>