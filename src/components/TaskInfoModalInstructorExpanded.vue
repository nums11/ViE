<template>

    <div class="task-info-modal-instructor-expanded">
        <div class="header-area">
            <div class="left-side">
                <div class="title-area"><h4>{{ getTaskTitle () }}</h4></div>
                <div class="subtitle-area">{{ getTaskDateTime () }}</div>
            </div>
            <div class="right-side">
                <div class="icon-area">
                    <!-- SPACE AVAILABLE -->
                    <sui-button 
                    v-if="taskInfo.taskType == 'qr-code'"
                    @click="expandQRCode"
                    compact icon="expand" />
                </div>
            </div>
        </div>

        <!-- Body Area -->
        <div class="body-area">
            <div class="body-contents">
                <qrcode 
                    :style="{margin: '0 auto'}"
                    v-if="taskInfo.taskType == 'qr-code'"
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
                <!-- RIGHT FOOTER PLACEHOLDER -->
            </div>
        </div>

        <transition name="fade" mode="out-in">
            <div class="fullscreen-modal" v-if="show_fullscreen_modal">

                <div class="full-content-area">

                    <div class="qr-code-fullscreen" v-if="taskInfo.taskType == 'qr-code'">
                        <qrcode 
                            :style="{margin: '0 auto'}"
                            :value="getUrlEncoded()"
                            :options="{
                                width: 800
                            }"
                        />
                    </div>

                </div>

                <div class="bottom-controls">
                    <sui-button @click="show_fullscreen_modal = false">Close</sui-button>
                </div>
            </div>
        </transition>
    </div>

</template>
<script>

import ProgressBar from "@/components/ProgressBar.vue";
import qrcode from '@chenfengyuan/vue-qrcode';
import { QrcodeStream } from 'vue-qrcode-reader';

export default {
    name: 'TaskInfoModalInstructorExpanded',
    components: {
        ProgressBar,
        qrcode,
        QrcodeStream
    },
    props: {
        taskInfo: Object,
        cancelTask: Function
    },
    data () {
        return {
            show_fullscreen_modal: false,

            DAY_OF_WEEK: ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri'],
            MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        }
    },
    methods: {
        getUrlEncoded () {
            return `http://localhost:8080/#/attend/${this.taskInfo.meetingId}/${this.taskInfo.qrCode}`
        },
        expandQRCode () {
            this.show_fullscreen_modal = true;
        },
        getTaskTitle () {
            if (this.taskInfo.taskType == 'qr-code') return `QR Submission`
        },
        getTaskDateTime () {
            // Thurs. August 23rd, 2:00pm-3:00pm
            let start_ = new Date(this.taskInfo.startTime)
            let end_ = new Date(this.taskInfo.endTime)

            let dt = `${this.DAY_OF_WEEK[start_.getDay()]}. ${this.MONTHS[start_.getMonth()]} ${start_.getDate()}, ${this.getHourMinute(start_)}`
            if (this.taskInfo.endTime) dt += `-${this.getHourMinute(end_)}`
            return dt
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