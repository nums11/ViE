<template>

    <div >
      <div class="task-info-modal">
          <div v-if="is_qr" class="left-side">
              <div class="title-area">
                  <div class="title">QR Checkin</div>
                  <div class="description"></div>
                  <div class="time-left venue-red-text">{{ new Date(task.qr_checkin_start_time) }} - {{ new Date(task.qr_checkin_end_time) }}</div>
              </div>
              <div  class="description-area">Attendance is tracked via QR Code Scanning.</div>
          </div>
          <div v-else class="left-side">
              <div class="title-area">
                  <div class="title">Recording</div>
                  <div class="description"></div>
                  <div class="time-left venue-red-text">{{ new Date(task.recording_submission_start_time) }} - {{ new Date( task.recording_submission_end_time) }}</div>
              </div>
              <div  class="description-area">Attendance is tracked via recording watching</div>
          </div>
          <sui-button @click="toggleSubmissions" class="show-qr-button">View Submissions</sui-button> 

          <div v-if="is_qr" class="right-side">
            <div class="icon-area">
                <img src="@/assets/icons/001-qr-code.svg" width="100%" height="100%" />
            </div>
          </div>
          <div v-else class="right-side">
            <div class="button-area">
              <img style="float:right;" src="@/assets/icons/003-play-button.svg" width="45%" height="100%" />
  <!--             <sui-button @click="focusThisTask" class="venue-green">
                <router-link :to="{name: 'watch_recording', params: { recording_id: task._id }}">
                  Watch Recording
                </router-link>
              </sui-button> -->
            </div>
          </div>
        </div>
      <StudentSubmissions v-if="show_submissions" :task="task" :is_qr="is_qr" />
    </div>

</template>

<script>
import QrCodeSVG from "@/assets/icons/001-qr-code.svg"
import StudentSubmissions from '@/views/StudentSubmissions'
export default {
    name: 'TaskInfoModal',
    components: {
      StudentSubmissions
    },
    data () {
      return {
        show_submissions: false
      }
    },
    props: {
      task: Object,
      is_qr: Boolean
    },
    created() {
      console.log("Task",this.task)
    },
    methods: {
        focusThisTask () {
            this.shouldFocus(this.taskInfo.id)
        },
        isQRSubmission () {
            return this.taskInfo.taskType == 'qr-code'
        },
        isActive () {
            let now = new Date ();
            let start_ = new Date(this.taskInfo.startTime)
            let end_ = this.taskInfo.endTime ? new Date(this.taskInfo.endTime) : null
            if (now < start_ || (end_ != null && now > end_)) return false
            return true
        },
        isPoll () {
            return this.taskInfo.taskType == 'poll'
        },
        isRecording () {
            return this.taskInfo.taskType == 'recording'
        },
        isLink () {
            return this.taskInfo.taskType == 'link'
        },
        isFileDownload () {
            return this.taskInfo.taskType == 'file-download'
        },
        toggleSubmissions () {
          this.show_submissions = !this.show_submissions
        }
    }
}
</script>

<style lang="scss">
  .show-qr-button {
    width: 8rem;
    margin: auto;
  }
    .task-info-modal {
        position: relative;
        margin-bottom: 25px;
        display: flex;
        padding: 10px;
        box-sizing: border-box;
        border-radius: 3px;
        border: #bababa solid thin;
        .left-side {
            flex-grow: 1;
            .title-area {
                div {
                    display: inline-block;
                    margin-right: 10px;
                }
                .title {
                    font-size: 1.2rem;
                    font-weight: 600;
                }
            }
            .description-area {
                font-size: 0.9rem;
            }
        }
        .right-side {
            min-width: 150px;
            .icon-area {
                width: 60px;
                height: 60px;
                float: right;
            }
            .button-area {
                position: absolute;
                bottom: 10px;
                right: 10px;
            }
        }
    }
    .dark-mode {
        .task-info-modal {
            background-color: #22252e;
            .right-side {
                .icon-area {
                    img {
                        filter: invert(100%);
                    }
                }
            }
        }
    }
    .light-mode {
        .task-info-modal {
            background-color: white;
            box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
        }
    }
</style>