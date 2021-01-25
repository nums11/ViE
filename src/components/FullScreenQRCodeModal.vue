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
            <div class="title-area">
              {{ submissions.length }}/{{ student_ids.size }} submissions
            </div>
            <ProgressBar
            :value="student_ids.length === 0 ? 0 :
            submissions.length / student_ids.size" />
          </div>
        </div>
        <div class="bottom-controls">
            <sui-button @click="$emit('hide-modal', submissions)">
              Close
            </sui-button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import ProgressBar from '@/components/ProgressBar.vue'
import QRCode from '@chenfengyuan/vue-qrcode';
import io from 'socket.io-client';
import helpers from '@/helpers.js'

export default {
  name: 'FullScreenQRCodeModal',
  mixins: [helpers],
  components: {
    QRCode,
    ProgressBar
  },
  props: {
    qr_scan: {
      type: Object,
      required: true
    },
    student_ids: {
      type: Set,
      required: true
    }
  },
  data() {
    return {
      submissions: []
    }
  },
  created() {
    this.getExistingSubmissions()
    this.startRealTimeQRScan()
    this.students = []
  },
  beforeDestroy() {
    this.endRealTimeQRScan()
  },
  methods: {
    getExistingSubmissions() {
      this.qr_scan.submissions.forEach(submission => {
        const submitter = submission.submitter
        this.addStudentSubmission({
          first_name: submitter.first_name,
          last_name: submitter.last_name,
          user_id: submitter.user_id
        })
      })
    },
    startRealTimeQRScan() {
      const url = this.getBaseURL()
      this.client_io = io (url, {forceNew: true})
      this.client_io.emit('startRealTimeQRScan', this.qr_scan._id)
      this.client_io.on('addStudentSubmission', (user_id) => {
        console.log("Adding student submission", submission)
        this.addStudentSubmission(submission)
      })
    },
    endRealTimeQRScan() {
      this.client_io.emit('endRealTimeQRScan', this.qr_scan._id)
    },
    getUrlEncoded() {
      let url = ""
      if(process.env.NODE_ENV === "production") {
        url = "https://viengage.com/"
      } else {
        url = "http://localhost:8080/"
      }
      return `${url}#/attend/${this.$route.params.meeting_id}/`
        + `${this.qr_scan._id}/${this.qr_scan.code}`
    },
    addStudentSubmission(submission) {
      this.submissions.push(submission)
      this.$forceUpdate()
    }
  }
}
</script>

<style scoped>
.fullscreen-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  background-color: white;
}

.bottom-controls {
  position: absolute;
  bottom: 40px;
  right: 40px;
}

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

</style>