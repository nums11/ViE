<template>

<div class="task-info-modal-instructor">

    <div class="upper-area">
        <div class="left-side">
            <div class="title-area"><h4>{{ getTaskTitle () }}</h4></div>
            <div class="subtitle-area">{{ getTaskDateTime () }}</div>
        </div>
        <div class="right-side">
            <div class="icon-area">

                <!-- Show QR Code icon only in QR mode -->
                <img class="image-icon" v-if="taskInfo.taskType == 'qr-code'" width="100%" height="100%" :src="require('@/assets/icons/001-qr-code.svg')" />
            </div>
        </div>
    </div>

    <div class="lower-area">
        <div class="left-side">
            <ProgressBar :value="0.5" suffix="Attendance" />
        </div>
        <div class="right-side">
            <sui-button 
                v-if="taskInfo.taskType == 'qr-code'"
                @click="shouldFocus(taskInfo.id)"
                secondary>Show QR Code</sui-button>
            <sui-button class="venue-blue" @click="shouldFocusTaskAttendance(taskInfo.id)">See Who Attended</sui-button>
        </div>
    </div>

</div>

</template>
<script>

import ProgressBar from "@/components/ProgressBar.vue"

export default {
    name: 'TaskInfoModalInstructor',
    props: {
        taskInfo: Object,
        shouldFocus: Function,
        shouldFocusTaskAttendance: Function
    },
    components: {
        ProgressBar
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

.task-info-modal-instructor {
    border-radius: 5px;
    margin-bottom: 25px;

    .upper-area {
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

        .right-side {
            .icon-area {
                width: 50px;
                height: 50px;
            }
        }
    }

    .lower-area {
        display: flex;
        box-sizing: border-box;
        padding: 10px 15px;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
        height: 60px;
        align-items: center;

        .left-side {
            flex-grow: 1;
        }
    }

}

.light-mode {
    .task-info-modal-instructor {
        background-color: white;
        border: 1px solid rgba(0, 0, 0, 0.25);
            box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);

        .lower-area {
            background-color: #E3EBF2;
        }
    }
}

.dark-mode {
    // 282c36
    .task-info-modal-instructor {
        background-color: #282c36;

        .lower-area {
            background-color: #313440;
        }
    }
}

</style>