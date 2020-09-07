<template>

  <div class='success-animation'>
    <div class="lottie-container" v-if="attendance_success">
      <v-lottie-player 
        name="QR CODE"
        :animationData="require('@/assets/lottie/qr-code-scan.json')"
        :loop="1"
        width="450px"
        height="450px"
        autoplay
      />
    </div>
  </div>

</template>
<script>
import VueLottiePlayer from 'vue-lottie-player'
export default {
  name: 'QRSuccessAnimation',
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
    width: 450px;
    height: 450px;
    margin: 0 auto;
    position: relative;
    top: 30%;
    border: 1px solid black;
  }
}

</style>