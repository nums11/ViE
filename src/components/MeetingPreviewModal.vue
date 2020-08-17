<template>
  <div>
    <!-- Preview Modal -->
    <sui-modal  :style="{ top: 'none', left: 'none', width: 'none', height: 'none' }">
      <sui-modal-header>Meeting Info Preview</sui-modal-header>
      <sui-modal-content scrolling>
        <sui-modal-description>
          <sui-header>{{ meeting.title }}</sui-header>
          <!-- Meeting Details -->
          <sui-label>
              Time Block
              <sui-label-detail>3:00pm - 4:50pm</sui-label-detail>
          </sui-label>

          <sui-label class="venue-red">
              Time Remaining
              <sui-label-detail>35mins</sui-label-detail>
          </sui-label>
          <!-- Meeting Contents -->
          <sui-item-group divided>
            <sui-item v-if="meeting.has_live_attendance && meeting.live_attendance.qr_checkins.length > 0">
              <sui-item-image size="tiny" class="icon-img" :src="QrCodeSVG" :style="{width: '40px'}" />
              <sui-item-content vertical-align="top">Submit your QR code attendance to be marked as present for this meeting.</sui-item-content>
            </sui-item>
            
            <sui-item v-if="meeting.has_live_attendance && meeting.live_attendance.live_polls.length > 0">
              <sui-item-image size="tiny" class="icon-img" :src="PollSVG" :style="{width: '40px'}" />
              <sui-item-content vertical-align="top">Submit your response to an uploaded poll.</sui-item-content>
            </sui-item>

            <sui-item v-if="meeting.has_async_attendance && meeting.async_attendance.recordings.length > 0">
              <sui-item-image size="tiny" class="icon-img" :src="RecordingSVG" :style="{width: '40px'}" />
              <sui-item-content vertical-align="top">Watch a recording uploaded by your instructor.</sui-item-content>
            </sui-item>

<!--                 <sui-item v-if="tasks != null && tasks.fileDownload != null">
              <sui-item-image size="tiny" class="icon-img" :src="FileSVG" :style="{width: '40px'}" />
              <sui-item-content vertical-align="top">Download a file uploaded by your instructor.</sui-item-content>
            </sui-item>

            <sui-item v-if="tasks != null && tasks.link != null">
              <sui-item-image size="tiny" class="icon-img" :src="LinkSVG" :style="{width: '40px'}" />
              <sui-item-content vertical-align="top">Access a link uploaded by your instructor.</sui-item-content>
            </sui-item> -->
          </sui-item-group>
        </sui-modal-description>
      </sui-modal-content>
      <sui-modal-actions>
        <sui-button v-on:click="$emit('hide-modal')">Close</sui-button>
        <router-link :to="{name: 'meeting_info', params: { meeting_id: meeting._id }}">
          <sui-button animated class="venue-blue text-white view-button" :style="{marginLeft: '10px'}">
              <sui-button-content class="undo-dark-mode" visible>View</sui-button-content>
              <sui-button-content hidden>
                  <sui-icon name="right arrow" />
              </sui-button-content>
          </sui-button>
        </router-link>
      </sui-modal-actions>
    </sui-modal>
  </div>
</template>

<script>
import QrCodeSVG from "@/assets/icons/001-qr-code.svg"
import PollSVG from "@/assets/icons/001-ballot.svg"
import FileSVG from "@/assets/icons/005-file.svg"
import RecordingSVG from "@/assets/icons/003-play-button.svg"
import LinkSVG from "@/assets/icons/002-link.svg"

export default {
    name: 'MeetingPreviewModal',
    props:{
        meeting: Object,
    },
    data: function () {
        return {
          QrCodeSVG: QrCodeSVG,
          PollSVG: PollSVG,
          FileSVG: FileSVG,
          RecordingSVG: RecordingSVG,
          LinkSVG: LinkSVG,
        }
    },
    created () {
    },
    methods: {
    }
}
</script>

<style lang="css">
/*.meeting-info-pill {
    margin-bottom: 20px;
    height: 55px;
    display: flex;
    align-items: center;
    padding: 0px 10px;
    border-radius: 3px;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.08);
}
.light-mode .meeting-info-pill {
    background-color: white;
}
.dark-mode .meeting-info-pill {
    background-color: #22252e;
}
.meeting-info-pill .left-side {
    flex-grow: 1;
}
.meeting-info-pill .right-side {
    display: flex;
    align-items: center;
}
.meeting-info-pill .right-side .icon-area {
    border-right: 1px solid rgba(0, 0, 0, 0.2);
    height: 20px;
}
.meeting-info-pill .right-side .icon-area .icon-wrapper {
    display: inline-block;
}
.meeting-info-pill .right-side .icon-area .icon-container {
    width: 20px;
    height: 20px;
    margin-right: 15px;
}
.light-mode .meeting-info-pill .right-side .icon-area .icon-container {
}
.dark-mode .meeting-info-pill .right-side .icon-area .icon-container img {
    filter: invert(100%);
}
.dark-mode {
    .ui.modal.standard.transition {
        background-color: #22252e;
        .header, .content, .actions {
            background-color: #22252e;
            color: white;
        }
        .icon-img img {
            filter: invert(100%);
        }
    }
    .undo-dark-mode {
        background-color: rgba(0, 0, 0, 0) !important;
    }
}
.text-white {
    color: white !important;
}
.view-button {
    position: relative;
    top: -1px;
}*/
</style>
