<template>
  <div class="meeting-attendance-pill-new">
    
    <div class="desktop-mode">

      <div class="date-area">
        <div class="month">{{ getMonth () }}</div>
        <div class="day">{{ getDay () }}</div>
      </div>
      <div class="meeting-area">
        <div class="label">{{ meeting.title }}</div>
      </div>
      <div class="tasks-area">
        <div class="task-icon" v-if="hasQR()"><img :src="require('@/assets/icons/001-qr-code.svg')" width="100%" height="100%" /></div>
        <!-- <div class="task-icon"><img :src="require('@/assets/icons/001-ballot.svg')" width="100%" height="100%" /></div>
        <div class="task-icon"><img :src="require('@/assets/icons/002-link.svg')" width="100%" height="100%" /></div>
        <div class="task-icon"><img :src="require('@/assets/icons/003-play-button.svg')" width="100%" height="100%" /></div> -->
      </div>

    </div>

  </div>
</template>
<script>

import { showAt, hideAt } from 'vue-breakpoints'

export default {
  name: "MeetingAttendancePill",
  components: {
    showAt, hideAt
  },
  props: {
    meeting: {}
  },
  data () {
    return {
      months: ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"]
    }
  },
  methods: {
    has (a, b) {
      return Object.prototype.hasOwnProperty.call(a, b)
    },
    getMonth () {
      let date = this.meeting.start_time
      if (!date) return "(none)"

      let date_ = new Date(date)
      return this.months[ date_.getMonth() ]
    },
    getDay () {
      let date = this.meeting.start_time
      if (!date) return "00"

      let date_ = new Date(date)
      return date_.getDay ()
    },
    hasQR () {
      return this.has(this.meeting, 'live_attendance') && this.has(this.meeting.live_attendance, 'qr_checkins') && this.meeting.live_attendance.qr_checkins.length > 0
    }
  }
}
</script>
<style lang="scss">
.meeting-attendance-pill-new {

  .desktop-mode {
    width: 300px;
    margin-right: 20px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    border: 2px solid #FF5E5E;
    height: 50px;
    border-radius: 5px;
    overflow: hidden;

    .date-area {
      padding-top: 3px;
      width: 55px;
      min-width: 55px;
      height: 50px;
      background-color: #FF5E5E;
      text-align: center;

      .month {
        font-weight: 600;
        font-size: 1rem;
      }

      .day {
        font-size: 1.7rem;
      }
    }

    .meeting-area {
      padding: 0 15px;
    }

    .tasks-area {
      padding: 5px 0;
      max-width: 95px;
      max-height: 50px;
      flex-direction: column;
      text-align: right;

      .task-icon {
        display: inline-block;
        width: 17px;
        height: 17px;
        margin-right: 5px;
        margin-bottom: 0px;
      }
    }
  }

}

@media only screen and (max-width: 670px) {
  .meeting-attendance-pill-new {
    .desktop-mode {
      width: 100%;
      max-width: 100%;
    }
  }
}

.dark-mode {
  .task-icon {
    img {
      filter: invert(100%);
    }
  }
}
</style>