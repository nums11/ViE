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
                width: 550,
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
          <p class="share-link">
            <strong>Share this link with students who can't scan:</strong>
            {{ getUrlEncoded() }}
          </p>
          <p class="inline-block error" id="outside-portion-msg">
            <span v-if="show_outside_portion_msg">
              The current time is outside of the real-time portion of your
              meeting so students will not be able to scan. You must edit
              the real-time portion of your meeting to allow scanning.
            </span>
          </p>
          <sui-button @click="$emit('hide-modal', submissions)"
          size="large" 
          style="">
            Close Window
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
import moment from 'moment'

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
    },
    real_time_portion: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      submissions: [],
      show_outside_portion_msg: false
    }
  },
  created() {
    this.getExistingSubmissions()
    const real_time_window_open = 
      this.checkIfRealTimeWindowIsOpen()
    if(real_time_window_open)
      this.startRealTimeQRScan()
    else
      this.show_outside_portion_msg = true
    this.students = []
  },
  beforeDestroy() {
    if(this.real_time_window_open)
      this.endRealTimeQRScan()
  },
  methods: {
    getExistingSubmissions() {
      this.qr_scan.submissions.forEach(submission => {
        this.addStudentSubmission(submission)
      })
    },
    checkIfRealTimeWindowIsOpen() {
      const now = Date.now()
      return moment(now).isBetween(this.real_time_portion.real_time_start,
        this.real_time_portion.real_time_end)
    },
    startRealTimeQRScan() {
      const url = this.getBaseURL()
      this.client_io = io (url, {forceNew: true})
      this.client_io.emit('startRealTimeQRScan', this.qr_scan._id)
      this.client_io.on('addStudentSubmission', (submitter) => {
        console.log("Adding student submission", submitter)
        this.addStudentSubmission({
          submitter: submitter
        })
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
      let encoded_url = `${url}#/attend/${this.$route.params.meeting_id}/`
        + `${this.qr_scan._id}/${this.qr_scan.code}`
      if(this.state_user.is_rpi_member)
        encoded_url += '/true'
      console.log("encoded_url", encoded_url)
      return encoded_url
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

.qr-code-fullscreen {
  width: 550px;
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

.share-link {
  text-align: center;
  line-height: 2rem;
  display: inline-block;
}

.bottom-controls {
  margin-top: 2rem;
}

#outside-portion-msg {
  width: 65%;
  margin-left: 15%;
  margin-right: 2rem;
  /*margin-left: 15rem;*/
  font-size: 1.25rem;
  font-weight: bold;
  text-align: center;
}

</style>