<template>

    <div class="task-info-modal-instructor-expanded">
        <div class="header-area">
            <div class="left-side">
                <div class="title-area">
                    <h4 v-if="is_qr">QR Submission </h4>
                    <h4 v-else>Recording</h4>
                </div>
                <div class="subtitle-area">{{ getTaskDateTime () }}</div>
            </div>
            <div class="right-side">
                <div class="icon-area">
                    <!-- SPACE AVAILABLE -->
                    <sui-button 
                    v-if="is_qr"
                    @click="showFullScreenQRCodeModal"
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
                    :value="task.code"
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
                <!-- RIGHT FOOTER PLACEHOLDER -->
            </div>
        </div>

<!--         <transition name="fade" mode="out-in">
            <div class="fullscreen-modal" v-if="show_fullscreen_modal">

                <div class="full-content-area">

                    <div class="qr-code-fullscreen" v-if="is_qr">
                        <qrcode 
                            :style="{margin: '0 auto'}"
                            :value="task.code"
                            :options="{
                                width: 800,
                            }"
                        />
                    </div>

                </div>

                <div class="bottom-controls">
                    <sui-button @click="show_fullscreen_modal = false">Close</sui-button>
                </div>
            </div>
        </transition> -->
        <FullScreenQRCodeModal v-if="show_qr_code_modal"
        v-on:hide-modal="hideFullScreenQRCodeModal" :code="task.code" />

    </div>

</template>
<script>
import ProgressBar from "@/components/ProgressBar.vue";
import FullScreenQRCodeModal from '@/components/FullScreenQRCodeModal.vue';
import QRCode from '@chenfengyuan/vue-qrcode';

export default {
  name: 'TaskInfoModalInstructorExpanded',
  components: {
    ProgressBar,
    FullScreenQRCodeModal,
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
    showFullScreenQRCodeModal () {
      this.show_qr_code_modal = true
    },
    hideFullScreenQRCodeModal() {
      this.show_qr_code_modal = false
    },
    getTaskTitle () {
        if (this.taskInfo.taskType == 'qr-code') return `QR Submission`
    },
    getTaskDateTime () {
        // Thurs. August 23rd, 2:00pm-3:00pm
        let start_ = null
        let end_ = null
        if(this.is_qr) {
          start_ = new Date(this.task.qr_checkin_start_time)
          end_ = new Date(this.task.qr_checkin_end_time)
        } else {
          start_ = new Date(this.task.recording_submission_start_time)
          end_ = new Date(this.task.recording_submission_end_time)
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

.task-info-modal-instructor-expanded {
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
    .task-info-modal-instructor-expanded {
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
    .task-info-modal-instructor-expanded {
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