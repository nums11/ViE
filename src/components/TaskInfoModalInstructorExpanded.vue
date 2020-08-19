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
                </div>
            </div>
        </div>

        <!-- Body Area -->
        <div class="body-area">
            <div class="body-contents">
                <qrcode 
                    :style="{margin: '0 auto'}"
                    v-if="taskInfo.taskType == 'qr-code'"
                    :value="taskInfo.qrCode"
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
            DAY_OF_WEEK: ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri'],
            MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        }
    },
    methods: {
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
}

.dark-mode {
    // 282c36
    .task-info-modal-instructor-expanded {
        background-color: #282c36;

        .footer-area {
            background-color: #313440;
        }
    }
}

</style>