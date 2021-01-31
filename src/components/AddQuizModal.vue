<template>
  <sui-modal v-model="show_modal">
    <sui-modal-header class="center-text">
      Add Quiz
    </sui-modal-header>
    <sui-modal-content class="center-text">
      <div class="inline-block" id="left-side">
        <VideoPreview v-if="show_video_preview"
        :video_source="video_source"
        ref="VideoPreview" />
      </div>
      <div class="inline-block" id="right-side">
        Right
      </div>
    </sui-modal-content>
    <sui-modal-actions>
      <div id="action-btns-container">
        <sui-button @click="cancelQuiz">Cancel</sui-button>
        <sui-button style="background-color:#00b80c;
        color:white; margin-left:2rem;">
          Save Quiz
        </sui-button>
      </div>
    </sui-modal-actions>
  </sui-modal>
</template>

<script>
import VideoPreview from '@/components/VideoPreview'

export default {
  name: 'AddQuizModal',
  data () {
    return {
      show_modal: false,
      show_video_preview: false,
      video_source: null,
    }
  },
  components: {
    VideoPreview
  },
  computed: {

  },
  created () {
  },
  methods: {
    showModal(video_file) {
      this.video_source = {
        src: URL.createObjectURL(video_file),
        type: "video/mp4"
      }
      this.show_modal = true
      this.show_video_preview = true
    },
    cancelQuiz() {
      this.show_video_preview = false
      this.video_source = null
      this.show_modal = false
    }
  }
}
</script>

<style scoped>
#left-side {
  border: blue solid;
  width: 60%;
}

#right-side {
  border: red solid;
  width: 40%;
}

#action-btns-container {
  width: 17rem;
  margin: auto;
}
</style>