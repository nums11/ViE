<template>

  <div class='success-animation'>
    <div class="lottie-container">
      <v-lottie-player 
        name="QR CODE"
        :animationData="require('@/assets/lottie/uploading.json')"
        loop
        width="300px"
        height="300px"
        autoplay
      />
    </div>
  </div>

</template>
<script>
import VueLottiePlayer from 'vue-lottie-player'
export default {
  name: 'UploadSuccessAnimation',
  components: {
    vLottiePlayer: VueLottiePlayer
  },
}
</script>
<style lang="scss">
.success-animation {
  z-index: 1000000000;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: white;
  .lottie-container {
    width: 300px;
    height: 300px;
    margin: 0 auto;
    position: relative;
    top: 20%;
  }
}
</style>