<template>
  <div class="meeting-attendance-pill">
    <router-link :to="{name: 'meeting_info', params: { meeting_id: meeting._id }}">
      <div class="pill-container">
        <div class="left-side">{{ meeting.title }} <template v-if="meeting.recurring_id != null">{{formatTime(meeting.start_time)}}</template></div>
        <div class="right-side">
          <div v-if="meeting.has_live_attendance && meeting.live_attendance.qr_checkins.length > 0" class="icon-area"><img src="@/assets/icons/001-qr-code.svg" width="100%" height="100%"/></div>
          <div v-if="meeting.has_live_attendance && meeting.live_attendance.live_polls.length > 0" class="icon-area"><img src="@/assets/icons/001-ballot.svg" width="100%" height="100%"/></div>
          <div v-if="meeting.has_async_attendance && meeting.async_attendance.recordings.length > 0" class="icon-area"><img src="@/assets/icons/003-play-button.svg" width="100%" height="100%"/></div>
<!--           <div class="icon-area"><img src="@/assets/icons/005-file.svg" width="100%" height="100%"/></div>
          <div class="icon-area"><img src="@/assets/icons/002-link.svg" width="100%" height="100%"/></div> -->
        </div>
      </div>
    </router-link>
  </div>
</template>

<script>
import moment from 'moment'
export default {
    name: 'MeetingAttendancePill',
    props: {
      meeting: {
        type: Object,
        required: true
      }
    },
    data: function () {
        return {
        }
    },
    created () {
    },
    methods: {
        formatTime(time){
            return moment(time).format("MM/DD/YYYY h:mm A");
        }
    }
}
</script>

<style lang="scss">
.meeting-attendance-pill {

    display: inline-block;
    min-width: 270px;
    margin-right: 12px;
    margin-bottom: 10px;
    box-sizing: border-box;
    padding: 0 10px;
    height: 30px;
    line-height: 30px;
    border-radius: 3px;
    cursor: pointer;
    transition: background-color 0.25s, box-shadow 0.3s;
    .pill-container {
        height: 30px;
        display: flex;
        align-items: center;
        font-weight: 600;
        .left-side {
            flex-grow: 1;
        }
        .right-side {
            
            .icon-area {
                width: 18px;
                height: 18px;
                display: inline-block;
                margin-left: 7px;
                position: relative;
                top: 3px;
            }
        }
    }
}
.light-mode {
    
    .meeting-attendance-pill {
        a {
            color: black;
        }

        border: #bababa solid thin;
        background-color: white;
        box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.12);
        .pill-container {
            color: rgba(0, 0, 0, 0.7);
        }
    }
    .meeting-attendance-pill:hover {
        box-shadow: 0px 4px 5px rgba(0, 0, 0, 0.17);
    }
}
.dark-mode {
    .meeting-attendance-pill {
        a {
            color: white;
        }

        background-color: #22252e;
        border: 1px solid #22252e;
        .pill-container {
            .right-side {
                .icon-area {
                    img {
                        filter: invert(100%);
                    }
                }
            }
        }
    }
    .meeting-attendance-pill:hover {
        background-color: #2f3340;
    }
}
</style>