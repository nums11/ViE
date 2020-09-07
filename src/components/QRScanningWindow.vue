<template>
  <div class="qr-scanning-window">
    <button @click="$emit('hide-window')" tabindex="0" aria-label="Hide QR Window">X</button>
    <qrcode-stream id="video_preview" @decode="attemptSubmission"></qrcode-stream>
  </div>
</template>

<script>
import { QrcodeStream } from 'vue-qrcode-reader'

export default {
  name: 'QRScanningWindow',
  components: {
    QrcodeStream,
  },
  props: {
  },
  data () {
    return {
    }
  },
  created () {

  },
  methods: {
    attemptSubmission(code){
      this.$emit('attempt-submission',code)
    }
  }
}
</script>

<style lang="scss" scoped>
.qr-scanning-window {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 10000;
  background-color: white;
}
</style>