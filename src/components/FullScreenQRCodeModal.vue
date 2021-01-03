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
                  width: 650,
              }"
            />
          </div>
          <div class="progress-bar-area">
            <div class="title-area">{{submissions.size}}/10 submissions</div>
            <ProgressBar :value="submissions.size/10" />
            <!-- <p>Refresh the page when done to see your attendance.</p> -->
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
import ProgressBar from '@/components/ProgressBar.vue'
import QRCode from '@chenfengyuan/vue-qrcode';
import io from 'socket.io-client';

export default {
  name: 'FullScreenQRCodeModal',
  components: {
    QRCode,
    ProgressBar
  },
  props: {
    qr_scan: {
      type: Object,
      required: true
    }
    // students: Array
  },
  data () {
    return {
      submissions: new Set()
    }
  },
  created () {
    this.getExistingSubmissions()
    this.startRealTimeQRScanUpdate ()
    this.students = []
  },
  methods: {
    getExistingSubmissions () {
      this.qr_scan.submissions.forEach(submission => {
        this.submissions.add(submission._id)
      })
    },
    startRealTimeQRScanUpdate () {
      console.log(`initializing socket`)
      let url = ""
      if(process.env.NODE_ENV === "production") {
        url = "https://byakugan.herokuapp.com/"
      } else {
        url = "http://localhost:4000/"
      }
      let client_io = io (url, {forceNew: true})
      client_io.emit('startRealTimeQRScanUpdate',
        this.qr_scan._id)
      // client_io.on('attendance update', (data) => {
      //     console.log(`SOCKET UPDATED`)
      //     console.log(data)
      //     // the data should be an array of User objects
      //     data.data.forEach(user => {
      //         this.submissions.add(user._id)
      //     })
      //     this.$forceUpdate ()
      // })
    },
    
    getUrlEncoded () {
      let url = ""
      if(process.env.NODE_ENV === "production") {
        url = "https://venue-attend.herokuapp.com/"
      } else {
        url = "http://localhost:8080/"
      }
      return `${url}#/attend/${this.$route.params.meeting_id}/${this.code}`
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
        width: 650px;
        margin: 0 auto;
    }

    .progress-bar-area {
      width: 400px;
      margin: 0 auto;
      text-align: center;
    }

    .title-area {
      font-size: 1.2rem;
      font-weight: 600;
    }

  }

}
</style>