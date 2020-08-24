<template>
    <div class="new-meeting">
        
        <transition
            name="fade2"
            mode="out-in">
            <div v-if="form_panel_id != null" class="sidenav-area">
                <div class="sidenav-section">
                    <h4>Live Tasks</h4>
                    <div v-if="Object.prototype.hasOwnProperty.call(new_meeting_info, 'live')"> 
                        <div :key="g" v-for="(task, g) in Object.keys(new_meeting_info.live)" class="form-info-tab">
                            <div class="value-area">{{ getTaskName(task, 'live') }}</div>
                            <div class="close-area" v-if="new_meeting_info.live[task].type != 'qr-code'"><i class="icon close"></i></div>
                        </div>
                    </div>
                </div>
                <div class="sidenav-section">
                    <h4>Async Tasks</h4>
                    <div v-if="Object.prototype.hasOwnProperty.call(new_meeting_info, 'async')">
                        <div :key="g" v-for="(task, g) in Object.keys(new_meeting_info.async)" class="form-info-tab">
                            <div class="value-area">{{ getTaskName(task, 'async') }}</div>
                            <div class="close-area" v-if="new_meeting_info.async[task].type != 'qr-code'"><i class="icon close"></i></div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
        
        <div :class="'content-area ' + (form_panel_id == null ? 'solo' : '')">
            
            <div class="title">New Meeting</div>
            <transition name="fade" mode="out-in">
                <div key="0" 
                    :style="{lineHeight: '30px'}"
                    v-if="form_panel_id != null" class="big-subtitle">
                    {{new_meeting_info.meta.meeting_name == "" ? "( untitled )" : new_meeting_info.meta.meeting_name }}
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
                                        v-for="(section, g) in course_sections"
                                        :key="g"
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
                                        <sui-dropdown class="venue-green" text="Add Asynchronous Tasks" button floating>
                                            <sui-dropdown-menu>
                                                <sui-dropdown-item @click="initiateAsyncTasks('poll')">
                                                    <div class="dropdown-icon-container"><span class="icon-ballot"></span></div>Poll/Quiz
                                                </sui-dropdown-item>
                                                <sui-dropdown-item @click="initiateAsyncTasks('link')">
                                                    <div class="dropdown-icon-container"><span class="icon-link"></span></div>Link
                                                </sui-dropdown-item>
                                                <sui-dropdown-item @click="initiateAsyncTasks('file-download')">
                                                    <div class="dropdown-icon-container"><span class="icon-file"></span></div>File Download
                                                </sui-dropdown-item>
                                                <sui-dropdown-item @click="initiateAsyncTasks('recording')">
                                                    <div class="dropdown-icon-container"><i class="icon play"></i></div>Recording
                                                </sui-dropdown-item>
                                            </sui-dropdown-menu>
                                        </sui-dropdown>
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

                            <transition-group name="fade" mode="out-in">
                                <div v-for="(task_data, i) in task_order" :key="i">
                                    
                                    <div class="subform-contents" v-if="task_data.id == form_panel_id">
                                        <div v-if="getSubformInfo(task_data) != null && getSubformInfo(task_data).type == 'qr-code'">
                                            <QRCodeForm
                                                :sections="new_meeting_info.meta.sections"
                                                :task_id="task_data.id"
                                                :updateTimeState="updateTimeState"
                                            />
                                        </div>
                                        <div v-else-if="getSubformInfo(task_data) != null && getSubformInfo(task_data).type == 'poll'">
                                            <PollCreationForm :updateTimeState="updateTimeState" :setPollData="setPollData" :task_id="form_panel_id" />
                                        </div>
                                        <div v-else-if="getSubformInfo(task_data) != null && getSubformInfo(task_data).type == 'link'">
                                            <LinkSubform
                                                :updateLinkTitle="updateLinkTitle"
                                                :updateLinkURL="updateLinkURL"
                                                :task_id="task_data.id"
                                                :updateTimeState="updateTimeState"
                                            />
                                        </div>
                                        <div v-else-if="getSubformInfo(task_data) != null && getSubformInfo(task_data).type == 'recording'">
                                            <RecordingUploadForm
                                                :task_id="task_data.id"
                                                :updateTimeState="updateTimeState"
                                                :handleRecordingUpload="handleRecordingUpload"
                                                :start_time="new_meeting_info.async[task_data.id].start_time"
                                                :end_time="new_meeting_info.async[task_data.id].end_time"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <!-- INTERMEDIATE PANEL -->
                                <div v-if="form_panel_id == -10" key="-10">
                                    <div v-if="meetingHasAsyncAndLive()">
                                        <h4>Meeting Form Complete</h4>
                                        <p>You have successfully added Asynchronous and Live tasks for this meeting.
                                            Click Complete Meeting Form to submit the new meeting.
                                        </p>
                                    </div>
                                    <div v-else>
                                        <h4>You're almost there</h4>
                                        <p>You have successfully added {{ creation_mode == 'live' ? 'live' : 'asynchronous' }} tasks for this meeting.
                                            You can either continue by adding {{ creation_mode == 'live' ? 'asynchronous' : 'live' }} tasks or
                                            submitting the new meeting now.
                                        </p>
                                    </div>

                                    <div :style="{display: 'flex', marginTop: '20px'}">

                                        <div v-if="!meetingHasAsyncAndLive ()">
                                            <sui-button 
                                            v-if ="creation_mode == 'async'"
                                            @click="initiateLiveTasks ()" 
                                            class="venue-blue">Add Live Tasks</sui-button>
                                            <sui-dropdown
                                            v-if="creation_mode == 'live'"
                                            class="labeled
                                            icon venue-blue"
                                            icon="plus"
                                            button
                                            :text="`Add to Asynchronous Section`"
                                            >
                                                <sui-dropdown-menu>
                                                    <sui-dropdown-item @click="initiateAsyncTasks('poll')">
                                                        <div class="dropdown-icon-container"><span class="icon-ballot"></span></div>Poll/Quiz
                                                    </sui-dropdown-item>

                                                    <sui-dropdown-item @click="initiateAsyncTasks('link')">
                                                        <div class="dropdown-icon-container"><span class="icon-link"></span></div>Link
                                                    </sui-dropdown-item>

                                                    <sui-dropdown-item>
                                                        <div class="dropdown-icon-container"><span class="icon-file"></span></div>File Download
                                                    </sui-dropdown-item>

                                                    <sui-dropdown-item @click="initiateAsyncTasks('recording')">
                                                        <div class="dropdown-icon-container"><i class="icon play"></i></div>Recording
                                                    </sui-dropdown-item>
                                                </sui-dropdown-menu>
                                            </sui-dropdown>
                                        </div>
                                        <div :style="{flexGrow: 1}">

                                        </div>
                                        <div>
                                            <sui-button class="venue-blue" @click="initiateNewMeetingUpload">Complete Meeting Form</sui-button>
                                        </div>

                                    </div>
                                </div>
                            </transition-group>

                            <div class="form-container-footer" id="form-footer-action">
                                <div class="back-area">
                                    <sui-button @click="goToPrevTask ()" content="Back" icon="left arrow" label-position="left" />
                                </div>
                                <div>
                                
                                <!-- Dropdown to Add more activities -->
                                <div :style="{textAlign: 'right', marginBottom: '10px'}">
                                    <sui-dropdown
                                    v-if="form_panel_id != -10"
                                    class="labeled
                                    icon venue-green"
                                    icon="plus"
                                    button
                                    :text="`Add to ${getCreationMode ()} Section`"
                                    >
                                        <sui-dropdown-menu>
                                            <sui-dropdown-item @click="addPollSection()">
                                                <div class="dropdown-icon-container"><span class="icon-ballot"></span></div>Poll/Quiz
                                            </sui-dropdown-item>

                                            <sui-dropdown-item @click="addLinkSection()">
                                                <div class="dropdown-icon-container"><span class="icon-link"></span></div>Link
                                            </sui-dropdown-item>

                                            <sui-dropdown-item>
                                                <div class="dropdown-icon-container"><span class="icon-file"></span></div>File Download
                                            </sui-dropdown-item>

                                            <sui-dropdown-item @click="addRecordingSection()">
                                                <div class="dropdown-icon-container"><i class="icon play"></i></div>Recording
                                            </sui-dropdown-item>
                                        </sui-dropdown-menu>
                                    </sui-dropdown>
                                </div>
                                <div>
                                    <sui-button 
                                        v-if="form_panel_id != -10"
                                        class="venue-blue" 
                                        @click="goToIntermediatePanel ()" 
                                        :content="`Complete ${getCreationMode()} Section`" 
                                        icon="check" label-position="left" />
                                    <!-- <sui-button @click="log_">DEBUG LOG</sui-button> -->
                                </div>


                                </div>
                            </div>

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
    import PollCreationForm from "@/components/meeting_form/PollCreationForm.vue"
    import LinkSubform from "@/components/meeting_form/LinkSubform.vue"
    import RecordingUploadForm from "@/components/meeting_form/RecordingUploadForm.vue"
    import CourseAPI from "@/services/CourseAPI"
    import MeetingTransformMod from "@/modules/MeetingTransform.module"
    import MeetingAPI from "@/services/MeetingAPI"

    export default {
        name: 'NewMeeting',
        components: {
            QRCodeForm,
            PollCreationForm,
            LinkSubform,
            RecordingUploadForm
        },
        data () {
            return {
                form_panel_id: null,
                tasks_count: 0,
                task_order: [],

                include_instructors_note: false,
                include_online_meeting_link: false,
                new_meeting_info: {},

                course_sections: [],
                creation_mode: null,
                course_info: {}
            }
        },
        created () {

            let course_id = this.$route.params.course_id
            let org_id = this.$route.params.org_id
            
            // window.addEventListener ('resize', this.setBottomActionPosition)
            this.getCourseInfo ()

            // set the new meeting meta
            this.new_meeting_info['meta'] = {
                meeting_name: '',
                course_id: '',
                sections: new Set(),
                instructors_note: '',
                online_meeting_link: null,
                for_course: course_id != undefined,
                course_org_id: course_id == undefined ? org_id : course_id
            }
        },
        methods: {

            handleRecordingUpload (e, task_id) {
                let file = e.target.files[0]

                // attach the file to the meeting object
                if (file == undefined) // file was removed or no file selected
                {
                    console.log(`file removed`)
                    this.new_meeting_info.async[task_id].video_blob = null;
                    return;
                }

                console.log(`file added`)
                this.new_meeting_info.async[task_id].video_blob = file
            },

            async initiateNewMeetingUpload () {

                let transform_result = await MeetingTransformMod( this.new_meeting_info )

                if (transform_result[0]) {
                    console.log(`Transform success`)
                    console.log(transform_result[1])

                    // Upload the meeting data
                    MeetingAPI.addMeeting(
                        transform_result[1], 
                        transform_result[1].for_course, 
                        this.new_meeting_info.meta.course_org_id
                    ).then(res => {
                        console.log(res)

                        if (res.status == 200) {
                            console.log(`Successfully created new Meeting`)
                            this.$router.push({ name: 'meeting_info', params: { meeting_id: res.data._id } })
                        }
                    })
                }

                // Error occurred
                else {
                    console.error(`Transform failed`)
                    console.log(transform_result[1])
                }
            },

            getCourseInfo () {
                console.log(`getCourseInfo`)
                CourseAPI.getCourse(this.$route.params.course_id)
                .then(res => {
                    console.log(res)

                    // default, only have 1 section.
                    if (res.data.sections == undefined) {
                        this.course_sections = [1]
                        this.new_meeting_info.meta.sections.add(1)
                    }
                })
            },

            meetingHasAsyncAndLive () {
                return Object.prototype.hasOwnProperty.call(this.new_meeting_info, 'async') && Object.prototype.hasOwnProperty.call(this.new_meeting_info, 'live')
            },

            log_ () {
                console.log(this.new_meeting_info)
            },

            goToIntermediatePanel () {

                this.form_panel_id = -10 // -10 will be set for the intermediate panel
                console.log(`Going to intermediate...`)
            },

            shortenString (str, len) {
                if (str.length <= len) return str;
                return str.substring(0, len-2) + "..."
            },

            getTaskName (task_id, type) {
                switch(this.new_meeting_info[type][task_id].type) {
                    case 'qr-code':
                        return "QR Code"
                    case 'link':
                        return this.new_meeting_info[type][task_id].title == "" ? "(untitled link)" : this.shortenString(this.new_meeting_info[type][task_id].title, 16)
                    case 'poll':
                        return "Poll"
                }
            },
            updateLinkTitle (e, task_id) {
                this.new_meeting_info[this.creation_mode][task_id].title = e.target.value

                this.$forceUpdate()
            },
            updateLinkURL (e, task_id) {
                this.new_meeting_info[this.creation_mode][task_id].link_target = e.target.value
                this.$forceUpdate()
            },

            updateTimeState (task_id, new_time, type) {
                this.new_meeting_info[this.creation_mode][task_id][type] = new_time
                this.$forceUpdate ()
            },

            getCreationMode () {
                if (this.creation_mode == 'live') return 'Live'
                if (this.creation_mode == 'async') return 'Async'
                return 'Undefined'
            },

            getSubformInfo (task_data) {
                // task_data should have an id & type
                if (task_data.type == 'live') {
                    if (Object.hasOwnProperty.call(this.new_meeting_info.live, task_data.id)) {
                        console.log(this.new_meeting_info.live[task_data.id])
                        return this.new_meeting_info.live[task_data.id]
                    }
                    return null
                }

                if (task_data.type == 'async') {
                    if (Object.hasOwnProperty.call(this.new_meeting_info.async, task_data.id)) {
                        return this.new_meeting_info.async[task_data.id]
                    }
                    return null
                }

                
            },

            setPollData (task_id, new_question_data) {
                console.log(`Updating Question Data for task ${task_id}`)
                this.new_meeting_info[this.creation_mode][task_id].questions = new_question_data
            },

            addRecordingSection () {
                console.log(`Adding Recording Section`)

                let task_id = this.tasks_count
                if (this.creation_mode == 'live') {
                    console.error (`Cannot create a recording for live portion of the meeting.`)
                    return;
                }
                else if (this.creation_mode == 'async') {
                    this.new_meeting_info.async[task_id] = {
                        type: 'recording',
                        start_time: (new Date()).toISOString (),
                        end_time: (new Date()).toISOString (),
                        video_blob: null
                    }

                    this.task_order.push({
                        id: task_id,
                        type: this.creation_mode
                    })

                    this.form_panel_id = task_id
                    ++ this.tasks_count
                    this.$forceUpdate ()
                }
            },

            addLinkSection () {
                // add a poll to the meeting
                console.log(`Adding Link Section`)

                let task_id = this.tasks_count

                if (this.creation_mode == 'live') {
                    this.new_meeting_info.live[task_id] = {
                        type: 'link',
                        start_time: null,
                        end_time: null,
                        title: "",
                        link_target: ""
                    }
                }
                else if (this.creation_mode == 'async') {
                    this.new_meeting_info.async[task_id] = {
                        type: 'link',
                        start_time: null,
                        end_time: null,
                        title: "",
                        link_target: ""
                    }
                }

                this.task_order.push({
                    id: task_id,
                    type: this.creation_mode
                })

                this.form_panel_id = task_id;
                ++ this.tasks_count
                this.$forceUpdate ()

                console.log(`End of addLinkSection`)
            },

            addPollSection () {
                // add a poll to the meeting
                console.log(`Adding Poll`)

                let task_id = this.tasks_count

                if (this.creation_mode == 'live') {

                    if (!Object.prototype.hasOwnProperty.call(this.new_meeting_info, 'live')) {
                        this.new_meeting_info.live = {}
                    }

                    this.new_meeting_info.live[task_id] = {
                        type: 'poll',
                        start_time: null,
                        end_time: null,
                        questions: []
                    }
                }
                else if (this.creation_mode == 'async') {
                    console.log(`Adding poll to async section`)

                    if (!Object.prototype.hasOwnProperty.call(this.new_meeting_info, 'async')) {
                        this.new_meeting_info.async = {}
                    }
                    this.new_meeting_info.async[task_id] = {
                        type: 'poll',
                        start_time: null,
                        end_time: null,
                        questions: []
                    }
                }

                this.task_order.push({
                    id: task_id,
                    type: this.creation_mode
                })

                this.form_panel_id = task_id;
                ++ this.tasks_count


                console.log(this.new_meeting_info)
                console.log(this.task_order)
                console.log(`End of addPollSection`)
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

                this.creation_mode = 'live'

                // create a new QR Code section, since that's the 1st possible live event that can happen
                let next_id = this.createQRCodeEntry();
                
                // go to the next index
                this.task_order.push({
                    id: next_id,
                    type: 'live'
                })

                this.form_panel_id = next_id;
            },

            initiateAsyncTasks (task_type) {
                // this.form_panel_index = 1;
                console.log(`Task type: ${task_type}`)

                if (!Object.prototype.hasOwnProperty.call( this.new_meeting_info, 'async' )) {
                    this.new_meeting_info.async = {}
                }
                this.creation_mode = 'async'

                switch(task_type) {
                    case 'poll':
                        this.addPollSection()
                        break
                    case 'link':
                        this.addLinkSection()
                        break
                    case 'recording':
                        this.addRecordingSection()
                        break
                    // case 'file-download':
                    //     this.addFileDownloadSection()
                    default:
                        console.log(`Section for ${task_type} has not been implemented yet.`)
                }
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
                    start_time: (new Date()).toISOString(),
                    end_time: (new Date()).toISOString(),
                    qr_start_time: (new Date()).toISOString(),
                    qr_end_time: (new Date()).toISOString()
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
            .form-info-tab {
                display: flex;
                text-align: right;

                .value-area {
                    flex-grow: 1;
                }

                .close-area {
                    width: 20px;
                    height: 20px;
                    line-height: 20px;
                    text-align: center;
                    margin-left: 10px;
                }
            }
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