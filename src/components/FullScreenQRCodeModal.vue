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
            <div class="title-area">{{attended.size}}/{{students.length}} Attended</div>
            <ProgressBar :value="attended.size/students.length" />
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
import { APIServerBaseURL, FrontEndServerBaseURL } from '@/services/API';
import io from 'socket.io-client';

export default {
  name: 'FullScreenQRCodeModal',
  components: {
    QRCode,
    ProgressBar
  },
  props: {
    code: {
      type: String,
      required: true
    },
    task: Object,
    students: Array
  },
  data () {
    return {
      attended: new Set()
    }
  },
  created () {
    this.getInitialAttended ()
    this.initializeAttendanceRealTimeUpdate ()
  },
  methods: {
    getInitialAttended () {
      this.task.qr_checkin_submissions.forEach(submission_ => {
        this.attended.add(submission_._id)
      })
    },
    initializeAttendanceRealTimeUpdate () {
            
      console.log(`initializing socket`)
      // console.log(APIServerBaseURL())
      console.log(`base url: ${APIServerBaseURL()}`)
      let client_io = io (APIServerBaseURL(), {forceNew: true})
      client_io.emit('start attendance update', {
          task_id: this.task._id,
          type: this.is_qr ? 'qr-code': 'unhandled type',
      })
      client_io.on('attendance update', (data) => {
          console.log(`SOCKET UPDATED`)
          console.log(data)
          // the data should be an array of User objects
          data.data.forEach(user => {
              this.attended.add(user._id)
          })
          this.$forceUpdate ()
      })
    },
    
    getUrlEncoded () {

      return `${FrontEndServerBaseURL()}/#/attend/${this.$route.params.meeting_id}/${this.code}`
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