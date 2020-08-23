<template>

    <div class="task-info-modal-instructor-expanded">
        <div class="left-content-area">
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
                    <ProgressBar :value="(attended_students.size) / students.length" />
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
                    <div class="student-attendance-area">
                        
                        <div class="header-area">
                            <div class="status-area">STATUS</div>
                            <div class="student-area">STUDENT</div>
                            <div class="total-col">{{(attended_students.size)}}/{{students.length}} Submissions</div>
                        </div>

                        <div class="entry-area" v-for="(student, i) in students" :key="i">
                            <div class="status-area">
                                <sui-icon name="check" class="venue-green-text" v-if="hasAttended(student)"/>
                                <sui-icon name="ellipsis horizontal"  class="venue-red-text" v-else />
                            </div>
                            <div class="student-area">{{student.first_name}} {{student.last_name}}</div>
                        </div>

                    </div>

                    <div class="bottom-controls">
                        <sui-button @click="show_fullscreen_modal = false">Close</sui-button>
                    </div>
                </div>
            </transition>
        </div>
        <hide-at breakpoint="small">
            <div class="attendance-area" v-if="taskInfo.taskType == 'qr-code'">
            
                <div class="header-area">
                    <div class="status-col">STATUS</div>
                    <div class="student-col">STUDENT NAME</div>
                    <div class="total-col">{{(attended_students.size)}}/{{students.length}} Submissions</div>
                </div>

                <div class="attendance-entry-container">
                    <div class="entry-area" v-for="(student, i) in students" :key="i">
                        <div class="status-col">

                            <!-- Lottie Status Animation -->
                            <div v-if="hasAttended(student)">
                                <!-- <v-lottie-player
                                    name="check"
                                    :animationData="require('@/assets/lottie/check.json')"
                                    width="20px"
                                    height="20px"
                                    :loop="1"
                                    :style="{margin: '0 auto'}"

                                /> -->
                                <sui-icon name="check" class="venue-green-text" />
                            </div>
                            <div v-else>
                                <sui-icon name="ellipsis horizontal" class="venue-red-text" />
                                <!-- <v-lottie-player
                                    name="check"
                                    :animationData="require('@/assets/lottie/wait-dots.json')"
                                    width="20px"
                                    height="20px"
                                    loop
                                    :style="{margin: '0 auto'}"

                                /> -->
                            </div>

                        </div>
                        <div class="student-col">{{student.first_name}} {{student.last_name}}</div>
                    </div>
                </div>

                <div class="footer-area">
                    <div class="spacer"></div>
                    <div class="button-area">
                        <sui-button 
                            compact icon="chart line" 
                            label-position="left"
                            class="venue-blue"
                            content="Stats" />
                    </div>
                </div>

            </div>
        </hide-at>
    </div>

</template>
<script>

import ProgressBar from "@/components/ProgressBar.vue";
import qrcode from '@chenfengyuan/vue-qrcode';
import { QrcodeStream } from 'vue-qrcode-reader';
import { showAt, hideAt } from 'vue-breakpoints';
import VueLottiePlayer from 'vue-lottie-player';
import io from 'socket.io-client';
import { baseURL, baseSourceURL } from '@/services/API';

export default {
    name: 'TaskInfoModalInstructorExpanded',
    components: {
        ProgressBar,
        qrcode,
        QrcodeStream,
        hideAt,
        vLottiePlayer: VueLottiePlayer
    },
    props: {
        taskInfo: Object,
        cancelTask: Function,
        students: Array
    },
    created () {

        this.setupInitalSubmissionsData ()
        this.initializeAttendanceRealTimeUpdate ()
    },
    data () {
        return {
            show_fullscreen_modal: false,
            attended_students: new Set (),
            DAY_OF_WEEK: ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri'],
            MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        }
    },
    methods: {
        setupInitalSubmissionsData () {

            if (this.taskInfo.submissions) {
                this.taskInfo.submissions.forEach(submission_ => {
                    this.attended_students.add (submission_.submitter._id)
                })
            }

        },
        initializeAttendanceRealTimeUpdate () {
            
            console.log(`initializing socket`)
            // console.log(baseURL)
            let client_io = io (baseURL(), {forceNew: true})
            client_io.emit('start attendance update', {
                task_id: this.taskInfo._id,
                type: this.taskInfo.taskType,
            })

            client_io.on('attendance update', (data) => {
                console.log(`SOCKET UPDATED`)
                console.log(data)

                // the data should be an array of User objects
                data.data.forEach(user => {
                    this.attended_students.add(user._id)
                    this.$forceUpdate ()
                })
            })
        },
        getUrlEncoded () {
            return `${baseSourceURL()}/#/attend/${this.taskInfo.meetingId}/${this.taskInfo.qrCode}`
        },
        expandQRCode () {
            this.show_fullscreen_modal = true;
        },
        getTaskTitle () {
            if (this.taskInfo.taskType == 'qr-code') return `QR Submission`
        },
        hasAttended (student_) {
            console.log(student_)
            console.log(student_._id)
            console.log(this.attended_students)
            console.log(this.attended_students.has(student_._id))
            return this.attended_students.has(student_._id)
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
    display: flex;

    .left-content-area {
        flex-grow: 1;
    }

    .attendance-area {
        width: 40%;
        min-width: 40%;
        padding: 0;
        position: relative;
        
        .header-area {
            overflow: hidden;
            display: flex;
            margin: 0;
            padding: 0;
            height: 30px;
            line-height: 30px;
            font-size: 0.85rem;
            cursor: pointer;

            .status-col {
                width: 80px;
                min-width: 80px;
                font-weight: 600;
                padding-left: 5px;
                text-align: center;
            }

            .student-col {
                flex-grow: 1;
                font-weight: 600;
                padding-left: 5px;
            }
        }

        .attendance-entry-container {
            overflow-y: scroll;
            position: absolute;
            left: 0;
            right: 0;
            bottom: 50px;
            top: 30px;

            .entry-area {
                display: flex;
                height: 27px;
                line-height: 27px;

                .status-col {
                    width: 80px;
                    min-width: 80px;
                    padding-left: 5px;
                    text-align: center;
                }

                .student-col {
                    flex-grow: 1;
                    padding-left: 5px;
                }
            }
        }

        .footer-area {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            margin: 0;
            padding: 0;
            height: 50px;
            line-height: 30px;
            font-size: 0.85rem;
            cursor: pointer;

            .spacer {
                flex-grow: 1;
            }

            .button-area {
                padding-right: 10px;
            }
        }
    }

    .fullscreen-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 2000;
        display: flex;

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
            flex-grow: 1;
        }

        .student-attendance-area {
            width: 30%;
            min-width: 30%;
            padding: 0;
            border-left: 1px solid rgba(255, 255, 255, 0.1);

            .header-area {
                display: flex;
                padding: 0;
                height: 30px;
                line-height: 30px;
                font-weight: 600;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);

                .status-area {
                    font-weight: 600;
                    width: 85px;
                    min-width: 40px;
                    height: 30px;
                    text-align: center;
                }
                .student-area {
                    font-weight: 600;
                    flex-grow: 1;
                    height: 30px;
                    padding-left: 15px;
                }
                .total-col {
                    padding-right: 10px;
                }
            }

            .entry-area {
                display: flex;
                padding: 0;
                height: 30px;
                line-height: 30px;
                font-weight: 600;

                .status-area {
                    width: 85px;
                    min-width: 40px;
                    height: 30px;
                    text-align: center;
                }
                .student-area {
                    flex-grow: 1;
                    height: 30px;
                    padding-left: 15px;
                }

                .total-col {
                    padding-right: 10px;
                    background-color: red;
                }
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

    .attendance-area {
        border-left: 1px solid rgba(0, 0, 0, 0.15);
        .header-area {
            border-bottom: 1px solid rgba(0, 0, 0, 0.15);
        }
    }
}

.dark-mode {
    .attendance-area {
        border-left: 1px solid rgba(255, 255, 255, 0.15);
        .header-area {
            border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        }
    }

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