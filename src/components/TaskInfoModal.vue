<template>

    <div class="task-info-modal">
        <div class="left-side">
            <div class="title-area">
                <div class="title">{{ taskInfo.taskName }}</div>
                <div class="description">{{ taskInfo.taskSubname == undefined ? "" : taskInfo.taskSubname }}</div>
                <div class="time-left venue-red-text">August 5th, 5pm EST - August 10th, 5pm EST</div>
            </div>
            <div class="description-area">{{ taskInfo.taskDescription }}</div>
        </div>
        <div class="right-side">
            <div v-if="isQRSubmission()" class="icon-area">
                <img src="@/assets/icons/001-qr-code.svg" width="100%" height="100%" />
            </div>
            <div v-else class="button-area">
                <sui-button v-if="!isActive()" disabled>Inactive</sui-button>
                <sui-button v-else-if="isActive() && isPoll()" @click="focusThisTask" class="venue-blue">Answer the Poll</sui-button>
                <sui-button v-else-if="isActive() && isRecording()" @click="focusThisTask" class="venue-green">Play Recording</sui-button>
                <sui-button v-else-if="isActive() && isLink()" @click="focusThisTask" class="venue-blue">Access Link</sui-button>
                <sui-button v-else-if="isActive() && isFileDownload()" @click="focusThisTask" class="venue-orange">Download</sui-button>
            </div>
        </div>
    </div>

</template>

<script>
import QrCodeSVG from "@/assets/icons/001-qr-code.svg"
export default {
    name: 'TaskInfoModal',
    props: {
        taskInfo: Object,
        shouldFocus: Function
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
        }
    }
}
</script>

<style lang="scss">
    .task-info-modal {
        position: relative;
        margin-bottom: 25px;
        display: flex;
        padding: 10px;
        box-sizing: border-box;
        border-radius: 3px;
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