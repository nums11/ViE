<template>

    <div class="qr-code-subform subform">

        <div class="area-title"><h3>Meeting Time</h3></div>
        <div class="subtitle">Pick the time(s) that the live meeting will occur for each section.</div>

        <div :style="{marginTop: '20px'}" v-if="sections.size > 1">
            <div><sui-checkbox label="Use same time for all meetings" v-model="sections_same_meeting_times" /></div>
        </div>
        <transition name="fade" mode="out-in">
            <div v-if="!sections_same_meeting_times">
                <div v-for="(section_num, i) in Array.from(sections).sort()" :key="i" class="section-time-picker">

                    <div class="section-title">Section {{ section_num }}</div>
                    <div class="dates-container">
                        <div class="date-start">
                            <div class="label">Start</div>
                            <VueCtkDateTimePicker 
                                @input="updateTime($event, section_num, 'start_time')"
                                v-model="section_meeting_times[section_num].start_time"
                                :min-date="(new Date()).toISOString()" />
                        </div>
                        <div class="separator"></div>
                        <div class="date-end">
                            <div class="label">End</div>
                            <VueCtkDateTimePicker 
                                @input="updateTime($event, section_num, 'end_time')"
                                v-model="section_meeting_times[section_num].end_time"
                                :min-date="section_meeting_times[section_num].start_time" />
                        </div>
                    </div>

                </div>
            </div>
            <div v-else>
            
                <div class="section-title" :style="{marginTop: '30px'}">Sections {{ getCombinedSectionsString() }}</div>
                    <div class="dates-container">
                    <div class="date-start">
                        <div class="label">Start</div>
                        <VueCtkDateTimePicker 
                            @input="updateAllTimes($event, 'start_time')"
                            v-model="section_meeting_times[getSourceSectionIndex ()].start_time"
                            :min-date="(new Date()).toISOString()" />
                    </div>
                    <div class="separator"></div>
                    <div class="date-end">
                        <div class="label">End</div>
                        <VueCtkDateTimePicker 
                            @input="updateAllTimes($event, 'end_time')"
                            v-model="section_meeting_times[getSourceSectionIndex ()].end_time"
                            :min-date="section_meeting_times[getSourceSectionIndex ()].start_time" />
                    </div>
                </div>

            </div>
        </transition>

        <div class="qr-code-selection-area">
            <div class="header-container">
                <div class="left-side">
                    <div class="title-area"><h3>QR Code Time(s)</h3></div>
                    <div class="desc-area">
                        During the live portion of the meeting, you can show QR codes at any time you pick for each
                        section.
                    </div>
                </div>
                <div class="right-side">
                    <div class="icon-area"><img src="@/assets/icons/001-qr-code.svg" width="100%" height="100%"/></div>
                </div>
            </div>

            <!-- <sui-message :style="{marginBottom: '20px'}" warning>
                        A QR Code will be provided at the time of the meeting. Below, please define the times of the
                        live meeting for each section.
            </sui-message> -->
        </div>
        <transition name="fade" mode="out-in">
            <div v-if="!sections_same_meeting_times">
                <div v-for="(section_num, i) in Array.from(sections).sort()" :key="i" class="section-time-picker">

                    <div class="section-title">Section {{ section_num }}</div>
                    <div class="dates-container">
                        <div class="date-start">
                            <div class="label">Start</div>
                            <VueCtkDateTimePicker 
                                @input="updateTime($event, section_num, 'qr_start_time')"
                                v-model="section_meeting_times[section_num].qr_start_time"
                                :min-date="section_meeting_times[section_num].start_time"
                                :max-date="section_meeting_times[section_num].end_time" />
                        </div>
                        <div class="separator"></div>
                        <div class="date-end">
                            <div class="label">End</div>
                            <VueCtkDateTimePicker 
                                @input="updateTime($event, section_num, 'qr_end_time')"
                                v-model="section_meeting_times[section_num].qr_end_time"
                                :min-date="section_meeting_times[section_num].qr_start_time"
                                :max-date="section_meeting_times[section_num].end_time" />
                        </div>
                    </div>

                </div>
            </div>
            <div v-else>
            
                <div class="section-title" :style="{marginTop: '30px'}">Sections {{ getCombinedSectionsString() }}</div>
                    <div class="dates-container">
                    <div class="date-start">
                        <div class="label">Start</div>
                        <VueCtkDateTimePicker 
                            @input="updateAllTimes($event, 'qr_start_time')"
                            v-model="section_meeting_times[getSourceSectionIndex ()].qr_start_time"
                            :min-date="section_meeting_times[getSourceSectionIndex ()].start_time"
                            :max-date="section_meeting_times[getSourceSectionIndex ()].end_time"
                        />
                    </div>
                    <div class="separator"></div>
                    <div class="date-end">
                        <div class="label">End</div>
                        <VueCtkDateTimePicker 
                            @input="updateAllTimes($event, 'qr_end_time')"
                            v-model="section_meeting_times[getSourceSectionIndex ()].qr_end_time"
                            :min-date="section_meeting_times[getSourceSectionIndex ()].qr_start_time" 
                            :max-date="section_meeting_times[getSourceSectionIndex ()].end_time"
                        />
                    </div>
                </div>

            </div>
        </transition>

        <!-- Introduction to Intergalactic Exploration and Geopolitical Imperalism -->
    </div>

</template>
<script>
export default {
    name: 'QRCodeForm',
    props: {
        sections: Set,
        updateTimeState: Function,
        task_id: Number
    },
    data () {
      return {
          sections_same_meeting_times: false,
          section_meeting_times: {}
      }  
    },
    methods: {

        updateTime (new_time, section_id, type) {
            // type \in (start, end)
            let TYPES = ['start_time', 'end_time', 'qr_start_time', 'qr_end_time'];
            if (!TYPES.includes(type)) return;

            this.section_meeting_times[section_id][type] = new_time
            if (type == 'start_time') {
                let start_ = new Date(this.section_meeting_times[section_id].start_time)
                let end_ = new Date(this.section_meeting_times[section_id].end_time)
                if (end_ < start_) {
                    // update end time
                    this.section_meeting_times[section_id].end_time = this.section_meeting_times[section_id].start_time
                }
            }

            this.updateTimeState (this.task_id, new_time, type)
            this.$forceUpdate()
        },

        updateAllTimes (new_time, type) {

            Array.from(this.sections).forEach(section_ => {
                this.updateTime(new_time, this.getSourceSectionIndex(), type)
            })
        },
        getSourceSectionIndex () {
          // this is used for cases where the meeting times are the same
          // accross all sections. So any section number can be used as the
          // model source of truth.

            let sections_arr = Array.from(this.sections)
            if (sections_arr.length == 0) return null
            return sections_arr[0]
        },

        getCombinedSectionsString () {
            let result = ""
            let i = 0
            this.sections.forEach(section_ => {
                if (i == this.sections.size - 1) result += `and ${section_}`
                else result += `${section_}, `

                ++i
            })
            return result
        },

        setupSectionMeetingTimes () {
            this.sections.forEach(section => {
                this.section_meeting_times[section] = {
                    start_time: new Date().toISOString(),
                    end_time: new Date().toISOString(),
                    qr_start_time: new Date().toISOString(),
                    qr_end_time: new Date().toISOString()
                }
            })

            console.log(this.section_meeting_times)
        },
        logData () {
            console.log(section_meeting_times)
        }

    },
    created () {
        console.log(`Sections for QR:`)
        console.log(this.sections)

        this.setupSectionMeetingTimes ()
    }
}
</script>
<style lang="scss">

.qr-code-subform {

    .qr-code-selection-area {
        margin-top: 30px;
        .header-container {
            display: flex;

            .left-side {
                flex-grow: 1;
                box-sizing: border-box;
                padding-right: 20px;

                .title-area {
                    margin-bottom: 10px;
                }

                .desc-area {
                    font-size: 0.9rem;
                }
            }
            .right-side {

                .icon-area {
                    width: 40px;
                    height: 40px;

                }
            }
        }
    }

    .section-time-picker {
        margin-top: 30px;
        margin-bottom: 30px;
    }
    .section-title {
        font-size: 1rem;
        font-weight: 600;
    }
    .dates-container {
        display: flex;

        .date-start, .date-end {
            .label {
                margin-top: 8px;
                margin-bottom: 8px;
            }
        }

        .date-start {
            width: 150px;
        }
        .separator {
            flex-grow: 1;
        }
        .date-end {
            width: 150px;
            text-align: right;
        }
    }
}

.dark-mode {

    .qr-code-subform {

        .qr-code-selection-area {
            .header-container {

                .left-side {

                    .title-area {
                    }

                    .desc-area {
                    }
                }
                .right-side {

                    .icon-area {
                        img {
                            filter: invert(100%);
                        }
                    }
                }
            }
        }
    }
}
</style>