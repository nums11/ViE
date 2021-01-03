 
<template>
  <div class="qr-scanning-window">
    <sui-button 
      class="cancel-button"
      @click="$emit('hide-window')" tabindex="0" aria-label="Hide QR Window">Close</sui-button>
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
    attemptSubmission(url){
      this.$emit('attempt-submission',url)
    }
  }
}
</script>

<style lang="scss" scoped>
.qr-scanning-window {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 10000;
  background-color: white;
}
.cancel-button {
  position: fixed;
  z-index: 10003;
  left: 10px;
  bottom: 10px;
}
</style>