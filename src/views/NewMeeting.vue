<template>

    <div class="new-meeting">
        
        
        <transition
            name="fade2"
            mode="out-in">
            <div v-if="form_panel_id != null" class="sidenav-area">
                <div class="sidenav-section">
                    <h4>Live Tasks</h4>
                </div>
                <div class="sidenav-section">
                    <h4>Async Tasks</h4>
                </div>
            </div>
        </transition>
        
        <div :class="'content-area ' + (form_panel_id == null ? 'solo' : '')">
            
            <div class="title">New Meeting</div>
            <transition name="fade" mode="out-in">
                <div key="0" 
                    :style="{lineHeight: '30px'}"
                    v-if="form_panel_id != null" class="big-subtitle">
                    {{new_meeting_info.meta.meeting_name == "" ? "< untitled >" : new_meeting_info.meta.meeting_name }}
                </div>
            </transition>

            <div class="contents">
                <transition name="fade" mode="out-in">
                <div class="" key="0">
                    <sui-label>
                        For Course
                        <sui-label-detail>Data Structures</sui-label-detail>
                    </sui-label>

                        <transition name="fade" mode="out-in">
                            <div v-if="form_panel_id != null" :style="{marginTop: '10px'}">
                                <sui-label
                                    :style="{marginBottom: '10px'}"
                                    v-for="(section, i) in new_meeting_info.meta.sections" :key="i">
                                    Section
                                    <sui-label-detail>{{ section }}</sui-label-detail>
                                </sui-label>
                            </div>
                        </transition>
                        

                    <div class="form-area">
                        
                        <transition name="fade" mode="out-in">
                        <div v-if="form_panel_id == null" key="0">
                            <sui-form>
                                <sui-form-field>
                                    <label>Meeting Name</label>
                                    <input v-model="new_meeting_info.meta.meeting_name" />
                                </sui-form-field>

                                <!-- DateTime Picker Component: https://github.com/chronotruck/vue-ctk-date-time-picker -->

                                <div class="form-section sections-selector">
                                    <sui-button 
                                        :style="{marginBottom: '10px'}"
                                        :class="new_meeting_info.meta.sections.has(section) ? 'venue-blue' : ''"
                                        v-for="section in course_sections"
                                        @click="toggleSectionInclude(section)"
                                        >
                                        Section {{section}}</sui-button>
                                </div>

                                <div class="form-section instructors-note">

                                    <div>
                                        <sui-checkbox label="Include Instructor's Note" v-model="include_instructors_note" />
                                    </div>
                                    <transition
                                        name="fade"
                                        mode="out-in">
                                        <div v-if="include_instructors_note" class="instructors-note-container">
                                            <div class="title-area">Instructor's Note</div>
                                            <div class="subtitle">Leave a note for your students to read when they see this meeting.</div>
                                            <div class="value-area">
                                                <textarea v-model="new_meeting_info.meta.instructors_note"></textarea>
                                            </div>
                                        </div>
                                    </transition>
                                </div>

                                <div class="online-meeting-area">
                                    <div>
                                        <sui-checkbox label="Online Meeting" v-model="include_online_meeting_link" />
                                        <transition
                                            name="fade"
                                            mode="out-in">
                                            <div class="field" :style="{marginTop: '10px', marginBottom: '15px'}" v-if="include_online_meeting_link">
                                                <input v-model="new_meeting_info.meta.online_meeting_link" />
                                            </div>
                                        </transition>
                                    </div>
                                </div>

                                <div class="continue-area" :style="{textAlign: 'right'}">
                                    <div :style="{marginBottom: '20px'}">
                                        <sui-button class="venue-green" @click="initiateLiveTasks" animated>
                                            <sui-button-content visible>Add Live Tasks</sui-button-content>
                                            <sui-button-content hidden>
                                                <sui-icon name="right arrow" />
                                            </sui-button-content>
                                        </sui-button>
                                    </div>
                                    <div>
                                        <sui-button class="venue-green" @click="initiateAsyncTasks" animated>
                                            <sui-button-content visible>Add Asynchronous Tasks</sui-button-content>
                                            <sui-button-content hidden>
                                                <sui-icon name="right arrow" />
                                            </sui-button-content>
                                        </sui-button>
                                    </div>
                                </div>

                                <!-- Here, place radio button to select whether to do a live or async meeting.
                                    For each type (live/async), provide a (+) button that allows to add entries
                                    such as file uploads, etc.

                                    If the type of meeting is LIVE, add a QR code by default.
                                    
                                    A date-time must be specified for each task that is within the bounds of the
                                    meeting time.
                                -->

                            </sui-form>
                        </div>

                        <div v-if="form_panel_id != null" key="1">

                            <transition name="fade" mode="out-in">
                                <div v-if="task_data.id == form_panel_id" v-for="(task_data, i) in task_order" :key="i">
                                    
                                    <div class="subform-contents">
                                        <QRCodeForm
                                            :v-if="getSubformInfo(task_data) != null && getSubformInfo(task_data).type == 'qr-code'"
                                            :sections="new_meeting_info.meta.sections"
                                        />
                                    </div>

                                    <div class="form-container-footer" id="form-footer-action">
                                        <div class="back-area">
                                            <sui-button @click="goToNextTask ()" content="Back" icon="left arrow" label-position="left" />
                                        </div>
                                        <div>
                                            <sui-button-group>
                                                <sui-button class="venue-green">One</sui-button>
                                                <sui-button class="venue-green">Two</sui-button>
                                                <sui-button class="venue-green">Three</sui-button>
                                            </sui-button-group>
                                        </div>
                                    </div>
                                </div>
                            </transition>

                        </div>
                        </transition>

                    </div>
                </div>
                </transition>
            </div>
        </div>
    </div>

 </template>
<script>
 
import QRCodeForm from "@/components/meeting_form/QRCodeForm.vue"

export default {
    name: 'NewMeeting',
    components: {
        QRCodeForm,
    },
    data () {
        return {
            form_panel_id: null,
            tasks_count: 0,
            task_order: [],

            include_instructors_note: false,
            include_online_meeting_link: false,
            new_meeting_info: {},

            course_sections: [1, 2, 3, 4, 5]
        }
    },
    created () {
        
        // window.addEventListener ('resize', this.setBottomActionPosition)

        // set the new meeting meta
        this.new_meeting_info['meta'] = {
            meeting_name: '',
            course_id: '',
            sections: new Set(),
            instructors_note: '',
            online_meeting_link: null
        }
    },
    methods: {

        getSubformInfo (task_data) {
            // task_data should have an id & type
            if (task_data.type == 'live') {
                if (Object.hasOwnProperty(this.new_meeting_info.live, task_data.id)) {
                    return this.new_meeting_info.live[task_data.id]
                }
                return null
            }

            if (task_data.type == 'async') {
                if (Object.hasOwnProperty(this.new_meeting_info.async, task_data.id)) {
                    return this.new_meeting_info.async[task_data.id]
                }
                return null
            }

              
        },

        setBottomActionPosition (e) {
            
            let action_footer = document.getElementById('form-footer-action')
            if (action_footer == null) return;

            // console.dir(action_footer)
            // console.log(window)

            let offset_ = action_footer.offsetTop // + action_footer.scrollTop
            let trav = action_footer.offsetParent
            while (trav != null) {
                offset_ += trav.offsetTop
                trav = trav.offsetParent
            }
            offset_ += action_footer.clientHeight / 2 - window.scrollY

            // console.log(`Offset Top: ${offset_}`)
            // console.log(`Inner Height: ${window.innerHeight}`)

            if (offset_ > window.innerHeight) {
                
                // make it fixed
                console.log('making fixed')
                action_footer.style.position = "fixed"
            }
            else {
                // undo position fixed
                console.log('unfixing')
                action_footer.style.position = "static"
            }
        },

        toggleSectionInclude (section_id) {
            if (this.new_meeting_info.meta.sections.has(section_id)) {
                // remove
                this.new_meeting_info.meta.sections.delete (section_id)
            }
            else {
                // add
                this.new_meeting_info.meta.sections.add (section_id)
            }

            this.$forceUpdate ();
        },

        initiateLiveTasks () {

            // create a new QR Code section, since that's the 1st possible live event that can happen
            let next_id = this.createQRCodeEntry();
            
            // go to the next index
            this.task_order.push({
                id: next_id,
                type: 'live'
            })

            this.form_panel_id = next_id;
        },

        initiateAsyncTasks () {
            // this.form_panel_index = 1;
        },

        getCurrentTaskIndex () {
            // find the index of the current task
            let ind_ = this._indexOf(this.task_order, this.form_panel_id, (a, b) => {
                return a.id == b
            })
            if (ind_ == -1) {
                console.error(`Task id ${this.form_panel_id} could not be found in the task order queue.`)
            }
            return ind_;
        },
        goToPrevTask () {
            let task_index = this.getCurrentTaskIndex ();
            this.form_panel_id = this.task_order[ Math.max(task_index - 1, 0) ].id
        },
        goToNextTask () {
            let task_index = this.getCurrentTaskIndex ();
            this.form_panel_id = this.task_order[ Math.min(task_index + 1, this.task_order.length - 1) ].id
        },

        createQRCodeEntry () {
            if (!Object.prototype.hasOwnProperty.call( this.new_meeting_info, 'live' )) {
                this.new_meeting_info.live = {}
            }

            let task_id = this.tasks_count
            this.new_meeting_info.live[task_id] = {
                type: 'qr-code',
                start_time: null,
                end_time: null
            }

            ++ this.tasks_count
            this.$forceUpdate ()

            return task_id
        },

        // debugging
        logToConsole () {
            console.log(this.new_meeting_info)
        },
        _log (data) {
            console.log(data)
        },

        // extensions
        _indexOf (array, value, equality) {
            let ind_ = 0;
            for(ind_; ind_ < array.length; ++ind_) {
                if (equality( array[ind_], value )) return ind_;
            }
            return -1;
        }

    },
    watch: {
        include_instructors_note: function (should) {
            if (should) this.new_meeting_info.meta.instructors_note = ''
            else this.new_meeting_info.meta.instructors_note = null
        },
        include_online_meeting_link: function (should) {
            if (should) this.new_meeting_info.meta.online_meeting_link = ''
            else this.new_meeting_info.meta.online_meeting_link = null
        }
    }
 }

</script>
<style lang="scss">

.new-meeting {
    width: 800px;
    margin: 0 auto;
    position: relative;
    display: flex;

    .content-area {
        width: 500px;
        transition: transform 0.25s;
        transform: translate(200px, 0px);
        // transition-timing-function: ease-in-out;
        transition-timing-function: ease-out;
        // transition-timing-function: ease-in;
        // transition-timing-function: ease;

        .subform-contents {
            margin-top: 10px;
            margin-bottom: 10px;
        }

        .form-container-footer {
            display: flex;
            margin-top: 30px;
            margin-bottom: 30px;
            bottom: 0;

            .back-area {
                flex-grow: 1;
            }
        }
    }
    .content-area.solo {
        transform: translate(100px, 0px);
    }
    .sidenav-area {
        width: 200px;
        position: fixed;
        box-sizing: border-box;
        padding-right: 30px;
        text-align: right;

        .sidenav-section {
            margin-bottom: 30px;
        }
    }

    .title {
        font-weight: 600;
        margin-bottom: 20px;
    }

    .big-subtitle {
        font-size: 2rem;
        margin-bottom: 20px;
    }

    .contents {

        .field {
            input {
                background-color: rgba(0, 0, 0, 0);
                transition: border 0.25s;
            }
            input:focus {
                background-color: rgba(0, 0, 0, 0);
                transition: border 0.25s;
            }
        }

        .form-area {
            margin-top: 30px;

            .form-section {
                margin-bottom: 30px;
            }

            .sections-selector {
                button {
                    margin-right: 15px;
                }
            }

            .instructors-note {
                .instructors-note-container {
                    margin-top: 15px;
                    background-color: #FF9167;
                    border-radius: 5px;
                    padding: 10px 10px 10px 40px;

                    .title-area {
                        font-weight: 600;
                        font-size: 1rem;
                        margin: 7px 0 2px;
                    }

                    .subtitle {
                        font-size: 0.8rem;
                    }

                    .value-area {
                        margin-top: 20px;
                        margin-bottom: 20px;
                        textarea {
                            background-color: rgba(0, 0, 0, 0);
                        }
                    }
                }
            }
        }
    }
}

.dark-mode {
    .new-meeting {

        .contents {

            .form-area {

                .field {

                    input {
                        color: white;
                        border: 1px solid rgba(255, 255, 255, 0.3);
                    }
                    input:focus {
                        border: 1px solid rgba(71, 196, 252, 0.6);
                    }
                }

                textarea {
                    color: white;
                }
            }
        }
    }
}

 </style>