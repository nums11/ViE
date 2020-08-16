<template>

    <div class="meeting-info">

        <div class="header">

            <!-- Page Title -->
            <div class="page-title">Meeting Info</div>
            <div class="page-info-area">

                <!-- Meeting Info Side -->
                <div class="left-side">
                    <h2>Lecture Name</h2>
                    <div class="details-area">
                        <sui-label :style="{marginBottom: '5px'}">
                            Course
                            <sui-label-detail>Data Structures</sui-label-detail>
                        </sui-label>

                        <sui-label class="venue-red" :style="{marginBottom: '5px'}">
                            Dept
                            <sui-label-detail>CSCI 1200</sui-label-detail>
                        </sui-label>

                        <sui-label :style="{marginBottom: '5px'}">
                            Time Block
                            <sui-label-detail>3:00pm - 4:00pm</sui-label-detail>
                        </sui-label>
                    </div>
                </div>

                <!-- Schedule Area -->
                <div class="right-side">
                    <MeetingInfoScheduleSlider
                        :tasksInfo="[{
                            startTime: '2020-08-12T08:51:42.612Z',
                            endTime: '2020-08-12T10:51:42.612Z',
                            taskType: 'qr-code',
                            taskName: 'QR Attendance Submission',
                            taskDescription: 'Scan the QR code to submit your attendance for this meeting',
                            id: 1
                        },{
                            startTime: '2020-08-12T08:51:42.612Z',
                            taskType: 'poll',
                            taskName: 'Rate your summer break from 1 to 10',
                            taskDescription: 'Submit your results for the poll for your instructor to view',
                            id: 2
                        },{
                            startTime: '2020-08-12T08:51:42.612Z',
                            taskType: 'file-download',
                            taskName: 'Textbook PDF',
                            taskDescription: 'Download the file document uploaded by your instructor',
                            id: 3
                        },{
                            startTime: '2020-08-13T08:51:42.612Z',
                            taskType: 'file-download',
                            taskName: 'Lecture 1 PDF',
                            taskDescription: 'Download the file document uploaded by your instructor',
                            id: 4
                        },{
                            startTime: '2020-08-13T08:51:42.612Z',
                            taskType: 'file-download',
                            taskName: 'Lecture 2 PDF',
                            taskDescription: 'Download the file document uploaded by your instructor',
                            id: 5
                        },{
                            startTime: '2020-08-14T08:51:42.612Z',
                            taskType: 'file-download',
                            taskName: 'Lecture 3 PDF',
                            taskDescription: 'Download the file document uploaded by your instructor',
                            id: 6
                        }]"
                    />
                </div>
            </div>
        </div>

        <div class="sidebar-area">
            
            <div class="instructor-info">
                <div class="name">Prof. David Goldschmidt</div>
                <div class="email-icon">
                    <span class="icon-email"></span>
                </div>
            </div>

        </div>

        <div class="top-spacer"></div>
        <div class="content-area-wrapper">
            <div class="left-spacer"></div>
            <div class="content-area">

                <transition
                    name="fade"
                    mode="out-in"
                >
                <div key="1" v-if="task_focus == null">
                    <div class="title"><h3>2 Live Tasks</h3></div>
                    <TaskInfoModal
                        :taskInfo="{
                                startTime: '2020-08-12T02:51:42.612Z',
                                endTime: '2020-08-12T10:51:42.612Z',
                                taskType: 'qr-code',
                                taskName: 'QR Submission',
                                taskDescription: 'Scan the QR code to submit your attendance',
                                id: 1
                            }"
                        :shouldFocus="focusTask"
                    />
                    <TaskInfoModal
                        :taskInfo="{
                                startTime: '2020-08-12T02:51:42.612Z',
                                taskType: 'poll',
                                taskName: 'Poll',
                                taskSubname: 'How many days do you need to complete the assignment?',
                                taskDescription: 'Answer the poll before the submission time ends.',
                                id: 2
                            }"
                        :shouldFocus="focusTask"
                    />
                    <TaskInfoModal
                        :taskInfo="{
                                startTime: '2020-08-14T02:51:42.612Z',
                                taskType: 'file-download',
                                taskName: 'Lecture 3 PDF',
                                taskSubname: 'GalaxiesTextbook.pdf',
                                taskDescription: 'Download the file document uploaded by your instructor',
                                id: 3
                            }"
                        :shouldFocus="focusTask"
                    />
                    <TaskInfoModal
                        :taskInfo="{
                                startTime: '2020-08-12T02:51:42.612Z',
                                taskType: 'link',
                                taskName: 'Physics Web Module',
                                taskSubname: 'Play around with the physics module',
                                taskDescription: 'Click the link',
                                id: 4
                            }"
                        :shouldFocus="focusTask"
                    />
                    <TaskInfoModal
                        :taskInfo="{
                                startTime: '2020-08-12T02:51:42.612Z',
                                taskType: 'file-download',
                                taskName: 'Physics Textbook',
                                taskSubname: 'IntroToPhysics.pdf',
                                taskDescription: 'Download the file document uploaded by your instructor',
                                id: 5
                            }"
                        :shouldFocus="focusTask"
                    />
                    <TaskInfoModal
                        :taskInfo="{
                                startTime: '2020-08-12T02:51:42.612Z',
                                taskType: 'recording',
                                taskName: 'Prerecorded Lecture 1',
                                taskSubname: 'Intro to Physics',
                                taskDescription: 'Watch the recording uploaded by your instructor',
                                id: 6
                            }"
                        :shouldFocus="focusTask"
                    />

                    <div class="title"><h3>2 Asynchronous Tasks</h3></div>
                    <TaskInfoModal
                        :taskInfo="{
                                startTime: '2020-08-12T02:51:42.612Z',
                                endTime: '2020-08-12T10:51:42.612Z',
                                taskType: 'qr-code',
                                taskName: 'QR Submission',
                                taskDescription: 'Scan the QR code to submit your attendance',
                                id: 7
                            }"
                        :shouldFocus="focusTask"
                    />
                    <TaskInfoModal
                        :taskInfo="{
                                startTime: '2020-08-12T02:51:42.612Z',
                                taskType: 'poll',
                                taskName: 'Poll',
                                taskSubname: 'How many days do you need to complete the assignment?',
                                taskDescription: 'Answer the poll before the submission time ends.',
                                id: 8
                            }"
                        :shouldFocus="focusTask"
                    />
                    <TaskInfoModal
                        :taskInfo="{
                                startTime: '2020-08-14T02:51:42.612Z',
                                taskType: 'file-download',
                                taskName: 'Lecture 3 PDF',
                                taskSubname: 'GalaxiesTextbook.pdf',
                                taskDescription: 'Download the file document uploaded by your instructor',
                                id: 9
                            }"
                        :shouldFocus="focusTask"
                    />
                    <TaskInfoModal
                        :taskInfo="{
                                startTime: '2020-08-12T02:51:42.612Z',
                                taskType: 'link',
                                taskName: 'Physics Web Module',
                                taskSubname: 'Play around with the physics module',
                                taskDescription: 'Click the link',
                                id: 10
                            }"
                        :shouldFocus="focusTask"
                    />
                    <TaskInfoModal
                        :taskInfo="{
                                startTime: '2020-08-12T02:51:42.612Z',
                                taskType: 'file-download',
                                taskName: 'Physics Textbook',
                                taskSubname: 'IntroToPhysics.pdf',
                                taskDescription: 'Download the file document uploaded by your instructor',
                                id: 11
                            }"
                        :shouldFocus="focusTask"
                    />
                    <TaskInfoModal
                        :taskInfo="{
                                startTime: '2020-08-12T02:51:42.612Z',
                                taskType: 'recording',
                                taskName: 'Prerecorded Lecture 1',
                                taskSubname: 'Intro to Physics',
                                taskDescription: 'Watch the recording uploaded by your instructor',
                                id: 12
                            }"
                        :shouldFocus="focusTask"
                    />
                </div>
                <div key="2" v-else>
                    <TaskInfoModalExpanded 
                        :taskInfo="{
                                startTime: '2020-08-12T02:51:42.612Z',
                                taskType: 'poll',
                                taskName: 'Poll',
                                taskSubname: 'How many days do you need to complete the assignment?',
                                taskDescription: 'Answer the poll before the submission time ends.',
                                pollOptions: [1, 2, 3, 4],
                                id: 8
                            }"
                            :cancelTask="cancelTask"
                    />
                </div>
                </transition>

            </div>
        </div>

    </div>

</template>

<script>

import MeetingInfoScheduleSlider from '@/components/MeetingInfoScheduleSlider.vue'
import TaskInfoModal from '@/components/TaskInfoModal.vue'
import TaskInfoModalExpanded from '@/components/TaskInfoModalExpanded.vue'

export default {
    name: 'MeetingInfo',
    components: {
        MeetingInfoScheduleSlider,
        TaskInfoModal,
        TaskInfoModalExpanded
    },
    data () {
        return {
            task_focus: null
        }
    },
    methods: {
        focusTask (task_id) {
            console.log(`Focusing task ${task_id}`)
            this.task_focus = true
        },
        cancelTask () {
            this.task_focus = null
        }
    }
}

</script>

<style lang="scss">

.meeting-info {

    // Header, With title and Schedule Slider
    .header {
        position: fixed;
        left: 155px;
        right: 50px;
        z-index: 3;

        .page-title {
            font-weight: 600;
        }

        .page-info-area {
            display: flex;

            .left-side {
                width: 360px;
                min-width: 360px;
            }

            .right-side {
                width: 75%;
                position: relative;
            }
        }
    }


    .top-spacer {
        height: 138px;
    }
    .left-spacer {
        width: 360px;
        min-width: 360px;
    }
    // Left Hand Side Area
    .sidebar-area {
        width: 360px;
        // background-color: green;
        position: fixed;
        bottom: 0;
        top: 230px;
        left: 155px;
        right: 50px;
        z-index: 3;

        .instructor-info {

            display: flex;
            align-items: center;
            height: 40px;
            width: 300px;
            margin-bottom: 30px;

            .name {
                flex-grow: 1;
            }
            .email-icon {
                width: 20px;
                height: 20px;
                line-height: 25px;
                font-size: 1.2rem;
                text-align: center;
            }
        }
    }

    // Main body area
    .content-area-wrapper {
        display: flex;
    }
    .content-area {
        position: relative;
        width: 72%;
        margin-right: 30px;
        margin-left: 30px;
        box-sizing: border-box;

        .title {
            margin-top: 10px;
            margin-bottom: 10px;
        }
    }
}

.dark-mode {
    .meeting-info {

        .page-title {
            background-color: #121419;
        }

        .page-info-area {
            .left-side {
                background-color: #121419;
            }
            .right-side {
                background-color: #121419;
            }
        }
    }
}

.light-mode {
    .meeting-info {

        .page-title {
            background-color: white;
        }
        .page-info-area {
            .left-side {
                background-color: white;
            }
            .right-side {
                background-color: white;
            }
        }
    }
}

@media only screen and (max-width: 900px) {
  .meeting-info {

    .header {
        position: relative;
        display: contents;

        
        .page-info-area {
            display: block;

            .left-side {
                width: 100%;
            }

            .right-side {
                width: 100%;
                position: relative;
                margin-top: 50px;
            }
        }
    }

    .sidebar-area {
        position: static;
        display: contents;
    }

    .top-spacer {
        height: 0px;
    }
    .left-spacer {
        width: 0px;
        min-width: 0px;
    }
    .content-area {
        position: relative;
        width: 100%;
    }
  }
}

</style>