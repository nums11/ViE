<template>
  <div>
    <transition name="fade" mode="out-in">
      <div class="fullscreen-modal">
        <div class="full-content-area">
          <div class="qr-code-fullscreen">
            <QRCode 
              :style="{margin: '0 auto'}"
              :value="getUrlEncoded()"
              :options="{
                  width: 800,
              }"
            />
          </div>
        </div>
        <div class="bottom-controls">
            <sui-button @click="$emit('hide-modal')">Close</sui-button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import QRCode from '@chenfengyuan/vue-qrcode';
import { baseURL, baseSourceURL } from '@/services/API';

export default {
  name: 'FullScreenQRCodeModal',
  components: {
    QRCode,
  },
  props: {
    code: {
      type: String,
      required: true
    }
  },
  data () {
    return {
    }
  },
  methods: {
    
    getUrlEncoded () {

      return `${baseSourceURL()}/#/attend/${this.$route.params.meeting_id}/${this.code}`
    },
  }
}
</script>

<style lang="scss" scoped>
.fullscreen-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;

  .bottom-controls {
    position: absolute;
    bottom: 40px;
    right: 40px;
  }

  .full-content-area {

    .qr-code-fullscreen {
        width: 800px;
        margin: 0 auto;
    }

  }

}
</style>