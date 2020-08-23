<template>
<div class="task-info-modal-instructor">
  <div class="upper-area">
    <div class="left-side">
        <div class="title-area">
          <h4 v-if="is_qr">QR Submission</h4>
          <h4 v-else>Recording</h4>
        </div>
        <div class="subtitle-area">{{ getTaskDateTime () }}</div>
    </div>
    <div class="right-side">
      <div class="icon-area">
        <!-- Show QR Code icon only in QR mode -->
        <img v-if="is_qr" src="@/assets/icons/001-qr-code.svg" width="100%" height="100%" />
        <img v-else src="@/assets/icons/003-play-button.svg" width="45%" height="100%" />
      </div>
    </div>
  </div>
  <div class="lower-area">
    <div class="left-side">
        <ProgressBar :value="0.5" suffix="Attendance" />
    </div>
    <div v-if="is_instructor" class="right-side">
      <sui-button v-if="is_qr" @click="$emit('show-task-qr',task)"
      content="Show QR Code" icon="qrcode" label-position="right" color="teal" />
      <sui-button class="venue-blue" @click="$emit('show-task-attendance',task)">See Who Attended</sui-button>
    </div>
    <div v-else>
      <sui-button 
          v-if="is_qr"
          @click="$emit('show-qr-scanning-window')"
          secondary>Scan QR Code</sui-button>
    </div>
  </div>
</div>

</template>
<script>

import ProgressBar from "@/components/ProgressBar.vue"

export default {
    name: 'TaskInfoModalInstructor',
    props: {
      task: Object,
      is_qr: Boolean,
      task_number: Number
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
    created () {
      console.log("Task Number",this.task_number)
      this.current_user = this.$store.state.user.current_user
      this.is_instructor = this.current_user.is_instructor
    },
    methods: {
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

.task-info-modal-instructor {
    margin-top:1rem;
    border-radius: 5px;

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