<template>

    <div class="meeting-info-schedule-slider">
        <div id="schedule-wrapper" class="schedule-wrapper">
            <div class="right-scroll-button scroll-button" v-if="wrapperWidth > containerWidth && leftOffset != (this.wrapperWidth * -1) + this.containerWidth" @click="slideRight">
                <span class="icon-right-arrow"></span>
            </div>
            <div class="left-scroll-button scroll-button" v-if="leftOffset != 0" @click="slideLeft">
                <span class="icon-left-arrow"></span>
            </div>
            <div id="schedule-scroller" 
                class="schedule-scroller" 
                :style="{
                    width: `${wrapperWidth}px`,
                    transform: `translate(${leftOffset}px, 0px)`
                }" 
                @dragstart="dragSlider">
                <div class="info-pill-day" v-for="task_day in getUniqueDayKeysSorted(getTasksGroupedByUniqueDay())" :key="task_day" @dragstart="dragSlider">
                    

                        <sui-popup v-for="(task_info, i) in getTasksGroupedByUniqueDay()[task_day].tasks" :key="i">
                            <sui-popup-header>{{task_info['taskName']}}</sui-popup-header>
                            <sui-popup-content>
                                    <sui-label :style="{marginBottom: '5px'}">
                                        Start Date
                                    <sui-label-detail>{{getStartDate(i)}}</sui-label-detail>
                                </sui-label>
                                <sui-label :style="{marginBottom: '5px'}">
                                    End Date
                                    <sui-label-detail>{{getEndDate(i)}}</sui-label-detail>
                                </sui-label>
                                <hr />
                                <div :style="{textAlign: 'center', marginTop: '20px'}">
                                    Right click to sync with your calendar.
                                </div>
                            </sui-popup-content>

                        <div
                        slot="trigger" 
                        :key="task_info.id" class="info-pill">
                            <div class="icon-area">
                                <img width="100%" height="100%" :src="getIcon( task_info['taskType'] )" />
                            </div>
                            <div class="text-area">{{ shorten(task_info['taskName'], 17) }}</div>
                        </div>
                    </sui-popup>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
import QrCodeSVG from "@/assets/icons/001-qr-code.svg"
import PollSVG from "@/assets/icons/001-ballot.svg"
import FileSVG from "@/assets/icons/005-file.svg"
import RecordingSVG from "@/assets/icons/003-play-button.svg"
import LinkSVG from "@/assets/icons/002-link.svg"
export default {
    name: 'MeetingInfoScheduleSlider',
    props: {
        tasksInfo: Array
    },
    data () {
        return {
            leftOffset: 0,
            wrapperWidth: 50000,
            containerWidth: 0,

            MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        }
    },
    methods: {
        getStartDate (index) {
            // August 10th 2020 @ 2:00pm
            let start_ = new Date(this.tasksInfo[index].startTime)
            let month = this.MONTHS[start_.getMonth()]
            let day = start_.getDate ()
            let year = start_.getFullYear()

            return `${month} ${day}, ${year}`
        },
        getEndDate (index) {
            let end_ = new Date(this.tasksInfo[index].endTime)
            let month = this.MONTHS[end_.getMonth()]
            let day = end_.getDate ()
            let year = end_.getFullYear()

            return `${month} ${day}, ${year}`
        },
        shorten(string_, max_length) {
            if (string_.length <= max_length) return string_;
            return string_.substring(0, max_length) + ".."
        },
        getDayString (iso_string) {
            let date_ = new Date (iso_string);
            return `${date_.getFullYear()}-${date_.getMonth() < 10 ? `0${date_.getMonth()}` : date_.getMonth() }-${date_.getDate() < 10 ? `0${date_.getDate()}` : date_.getDate() }`
        },
        getTasksGroupedByUniqueDay () {
            let grouped_tasks = {}
            for (var i = 0; i < this.tasksInfo.length; ++i) {
                if (Object.prototype.hasOwnProperty.call( grouped_tasks, this.getDayString(this.tasksInfo[i].startTime) )) {
                    grouped_tasks[ this.getDayString(this.tasksInfo[i].startTime) ].tasks.push(this.tasksInfo[i]);
                }
                else {
                    grouped_tasks[ this.getDayString(this.tasksInfo[i].startTime) ] = {
                        // day: ,
                        tasks: [ this.tasksInfo[i] ]
                    }
                }
            }
            return grouped_tasks
        },
        getUniqueDayKeysSorted (tasks_) {
            let unique_days = Object.keys(tasks_)
            unique_days.sort((a, b) => {
                let year_a = parseInt(a.substring(0, 4));
                let year_b = parseInt(b.substring(0, 4));
                if (year_a != year_b) {
                    return year_a < year_b ? 1 : -1;
                }
                let month_a = parseInt(a.substring(5, 7));
                let month_b = parseInt(b.substring(5, 7));
                if (month_a != month_b) {
                    return month_a < month_b ? 1 : -1;
                }
                let day_a = parseInt(a.substring(8));
                let day_b = parseInt(b.substring(8));
                if (day_a != day_b) {
                    return day_a < day_b ? 1 : -1;
                }
                return 0;
            })
            return unique_days
        },
        getIcon (icon_id) {
            switch(icon_id) {
                case 'qr-code':
                    return QrCodeSVG;
                case 'poll':
                    return PollSVG;
                case 'file-download':
                    return FileSVG;
                case 'recording':
                    return RecordingSVG;
                case 'link':
                    return LinkSVG;
            }
        },
        dragSlider () {
            console.log("Dragging")
        },
        slideLeft () {
            this.leftOffset = Math.min (0, this.leftOffset + 300)
        },
        slideRight () {
            this.leftOffset = Math.max ((this.wrapperWidth * -1) + this.containerWidth, this.leftOffset - 300)
        },
        calculateWrapperWidth () {
            let wrapper = document.getElementById('schedule-scroller')
            var max_width = 0;
            let child_;
            const BUFFER_SPACE = 20;
            for ( var i = 0; i < wrapper.children.length; ++i ) {
                child_ = wrapper.children[i];
                max_width += child_.offsetWidth + 5;
            }
            
            this.wrapperWidth = max_width + BUFFER_SPACE
        },
        calculateContainerWidth () {
            let container = document.getElementById("schedule-wrapper")
            this.containerWidth = container.offsetWidth
        },
        resetScheduleSlider () {
            console.log("resized")
            this.calculateContainerWidth ()
            this.leftOffset = 0
        }
    },
    created () {
    },
    mounted () {
        console.log("Loaded!");
        this.calculateWrapperWidth ()
        this.calculateContainerWidth ()
        window.addEventListener('resize', this.resetScheduleSlider)
        console.log(window)
    }
}
</script>

<style lang="scss">
.meeting-info-schedule-slider {
    position: absolute;
    bottom: 0;
    width: 100%;
    .schedule-wrapper {
        height: 40px;
        position: relative;
        width: 100%;
        overflow: hidden;
        .scroll-button {
            width: 40px;
            height: 40px;
            line-height: 40px;
            position: absolute;
            z-index: 3;
            cursor: pointer;
            transition: border 0.25s, background-color 0.25s, box-shadow 0.25s;
            border-radius: 1px;
            font-size: 1.2rem;
            text-align: center;
        }
        .scroll-button.left-scroll-button {
            left: 0;
        }
        .scroll-button.right-scroll-button {
            right: 0;
        }
        .schedule-scroller {
            position: relative;
            transition: transform 0.25s;
            // transition-timing-function: ease-in-out;
            // transition-timing-function: ease-out;
            // transition-timing-function: ease-in;
            transition-timing-function: ease;
            display: flex;
            .info-pill-day {
                
                margin-right: 25px;
                display: flex;
                .info-pill {
                    min-width: 230px;
                    height: 35px;
                    line-height: 35px;
                    margin-top: 2.5px;
                    background-color: #5EFFB4;
                    margin-right: 5px;
                    border-radius: 3px;
                    padding: 0px 8px;
                    cursor: pointer;
                    font-weight: 600;
                    opacity: 0.8;
                    transition: opacity 0.25s;
                    div {
                        display: inline-block;
                        vertical-align: middle;
                    }
                    .icon-area {
                        width: 25px;
                        height: 25px;
                        margin-right: 8px;
                    }
                    .text-area {
                    }
                }
                .info-pill:hover {
                    opacity: 1;
                }
            }
        }
    }
}
.dark-mode {
    .meeting-info-schedule-slider {
        .info-pill {
            color: black !important;
        }
        .scroll-button {
            background-color: #22252e;
            border: 1px solid black;
        }
        .scroll-button:hover {
        }
        .scroll-button.left-scroll-button {
            box-shadow: 5px 0px 10px 8px rgba(0, 0, 0, 0.3);
        }
        .scroll-button.left-scroll-button:hover {
            box-shadow: 8px 0px 10px 8px rgba(0, 0, 0, 0.3);
        }
        .scroll-button.right-scroll-button {
            box-shadow: -5px 0px 10px 8px rgba(0, 0, 0, 0.40);
        }
        .scroll-button.right-scroll-button:hover {
            box-shadow: -8px 0px 10px 8px rgba(0, 0, 0, 0.40);
        }
    }
}
.light-mode {
    .meeting-info-schedule-slider {
        .scroll-button {
            background-color: white;
            border: 1px solid #727375;
        }
        .scroll-button:hover {
            border: 1px solid #404142;
        }
        .scroll-button.left-scroll-button {
            box-shadow: 5px 0px 10px 8px rgba(0, 0, 0, 0.05);
        }
        .scroll-button.right-scroll-button {
            box-shadow: -5px 0px 10px 8px rgba(0, 0, 0, 0.05);
        }
        .scroll-button.left-scroll-button:hover {
            box-shadow: 8px 0px 10px 8px rgba(0, 0, 0, 0.09);
        }
        .scroll-button.right-scroll-button:hover {
            box-shadow: -8px 0px 10px 8px rgba(0, 0, 0, 0.09);
        }
    }
}
</style>