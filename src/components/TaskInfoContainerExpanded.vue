<template>
  <div class="task-info-container-expanded">
    <div class="header-area">
      <div class="left-side">
        <div class="title-area">
          <h4 v-if="is_qr">QR Submission </h4>
          <h4 v-else>Video</h4>
        </div>
        <div class="subtitle-area">{{ getTaskDateTime () }}</div>
      </div>
      <div class="right-side">
        <div class="icon-area">
          <!-- SPACE AVAILABLE -->
          <sui-button 
          v-if="is_qr"
          @click="$emit('show-fullscreen-code',task.code)"
          compact icon="expand" />
        </div>
      </div>
    </div>

    <!-- Body Area -->
    <div class="body-area">
      <div class="body-contents">
        <QRCode 
          :style="{margin: '0 auto'}"
          v-if="is_qr"
          :value="getUrlEncoded()"
          :options="{
              width: 400,
          }"
        />
      </div>
    </div>

    <!-- Footer Area -->
    <div class="footer-area">
      <div class="left-side">
        <sui-button 
          compact icon="left arrow" 
          label-position="left" 
          @click="cancelTask"
          content="Back" />
      </div>
      <div class="center-area">
        <ProgressBar :value="0.8" />
      </div>
      <div class="right-side">
          <sui-button class="float-right venue-blue" @click="$emit('show-task-attendance',task)"
        content="View Attendance" icon="users" label-position="right" />
      </div>
    </div>
  </div>
</template>

<script>
import ProgressBar from "@/components/ProgressBar.vue";
import QRCode from '@chenfengyuan/vue-qrcode';

export default {
  name: 'TaskInfoContainerExpanded',
  components: {
    ProgressBar,
    QRCode
  },
  props: {
    task: Object,
    is_qr: Boolean,
    cancelTask: Function
  },
  data () {
    return {
      show_qr_code_modal: false,
      DAY_OF_WEEK: ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri'],
      MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    }
  },
  methods: {
    getUrlEncoded () {
      let url = ""
      if(process.env.NODE_ENV === "production") {
        url = "https://venue-attend.herokuapp.com/"
      } else {
        url = "http://localhost:8080/"
      }
      return `${url}#/attend/${this.$route.params.meeting_id}/${this.task.code}`
    },
    getTaskTitle () {
        if (this.taskInfo.taskType == 'qr-code') return `QR Submission`
    },
    getTaskDateTime () {
        // Thurs. August 23rd, 2:00pm-3:00pm
        let start_ = null
        let end_ = null
        if(this.is_qr) {
          start_ = new Date(this.task.qr_scan_start_time)
          end_ = new Date(this.task.qr_scan_end_time)
        } else {
          start_ = new Date(this.task.video_submission_start_time)
          end_ = new Date(this.task.video_submission_end_time)
        }

        return `${this.DAY_OF_WEEK[start_.getDay()]}. ${this.MONTHS[start_.getMonth()]} ${start_.getDate()}, ${this.getHourMinute(start_)}-${this.getHourMinute(end_)}`
    },
    getHourMinute (time) {
        let hour = (time.getHours () + 1) % 12
        let minute = time.getMinutes () < 10 ? `0${time.getMinutes()}` : time.getMinutes()
        let suffix = hour >= 11 ? 'pm' : 'am'

        return `${hour}:${minute}${suffix}`
    }
  }
}
</script>
<style lang="scss">

.task-info-container-expanded {
    border-radius: 3px;
    margin-bottom: 30px;

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

    .header-area {
        display: flex;
        box-sizing: border-box;
        padding: 10px 15px;

        .left-side {
            flex-grow: 1;

            display: flex;
            .title-area {
                margin-right: 10px;
            }
        }
    }

    .body-area {
        min-height: 450px;
        box-sizing: border-box;
        padding: 10px 15px;

        .body-contents {
            text-align: center;
        }
    }

    .footer-area {
        box-sizing: border-box;
        padding: 10px 15px;
        display: flex;
        align-items: center;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;

        .center-area {
            flex-grow: 1;
            text-align: center;
        }
    }

}

.light-mode {
    .task-info-container-expanded {
        background-color: white;
        border: 1px solid rgba(0, 0, 0, 0.25);
            box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);

        .footer-area {
            background-color: #E3EBF2;
        }
    }
    .fullscreen-modal {
        background-color: white;
    }
}

.dark-mode {
    // 282c36
    .task-info-container--expanded {
        background-color: #282c36;

        .footer-area {
            background-color: #313440;
        }
    }

    .fullscreen-modal {
        background-color: #121419;
    }
}

</style>