<template>
  
  <div class="new-meeting-form">
    
    <div class="form-center">

      <div class="left-side-area">
        <div class="logo-area"></div>
        <div class="tasks-list">
          <div class="section-header">LIVE TASKS</div>
          <div class="empty-area">No live tasks</div>
        </div>
        <div class="tasks-list">
          <div class="section-header">ASYNCHRONOUS TASKS</div>
          <div class="empty-area">No asynchronous tasks</div>
        </div>
      </div>
      <div class="right-side-area"> 
        <div class="new-meeting-title">
          <div class="label">NEW MEETING</div>
          <h3>{{ course_org_info == null ? '(undefined)' : course_org_info.name}}</h3>
        </div>
        <div class="meeting-name">
          <InputField2
            v-model="meeting_data.meta.title"
            :validate="{
              mustBeFilled: (x) => [x.length > 0, 'Field cannot be left empty.']
            }"
            :config="{
              label: 'Meeting Name',
              icon: 'users',
              width: '60%'
            }"
          />
          <div class="info-area">
            Enter the name for your meeting.
          </div>
        </div>


        <div class="live-meeting-portion">
          <div>
            <div class="checkbox">
              <input type="checkbox" v-model="has_live" />
              <label>Include live meeting checkin</label>
            </div>
          </div>
          

          <transition name="fade" mode="out-in">
            <div v-if="has_live">
              <div class="meeting-time-picker-area" :style="{width: '60%'}">
                <h4>Meeting Time</h4>
                <div class="date-label">START TIME</div>
                <VueCtkDateTimePicker 
                  @input="$forceUpdate ()"
                  v-model="meeting_data.meta.start_time"
                  id="input1"  
                />
                <!-- :min-date="(new Date()).toISOString()"
                  :max-date="meeting_data.meta.end_time" -->

                  <div class="date-label" :style="{marginTop: '20px'}">END TIME</div>
                  <VueCtkDateTimePicker 
                    @input="$forceUpdate ()"
                    v-model="meeting_data.meta.end_time"
                    id="input2"
                  />

                  <div class="info-area" :style="{transform: `translateY(18px)`}">
                    Pick the start time and end time for the live portion of your meeting.
                  </div>

              </div>
              <div class="meeting-time-picker-area" :style="{width: '60%', marginTop: '30px'}">
                <h4>QR Checkin Time</h4>
                <div class="date-label">START TIME</div>
                <VueCtkDateTimePicker 
                  @input="$forceUpdate ()"
                  v-model="meeting_data.live.qr_checkin.start_time"
                  id="input3"
                  />

                  <div class="date-label" :style="{marginTop: '20px'}">END TIME</div>
                  <VueCtkDateTimePicker 
                    @input="$forceUpdate ()"
                    v-model="meeting_data.live.qr_checkin.end_time"
                    id="input4"
                  />

                  <div class="info-area" :style="{transform: `translateY(18px)`}">
                    Pick the start time and end time that your students will be able to submit
                    for the QR code checkin. This should occur at some point within your live
                    meeting.
                  </div>

              </div>
            </div>
          </transition>
        </div>

        <div class="live-meeting-portion">
          <div>
            <div class="checkbox">
              <input type="checkbox" v-model="has_async" />
              <label>Include recording</label>
            </div>
          </div>
          

          <transition name="fade" mode="out-in">
            <div v-if="has_async">
              <div class="meeting-time-picker-area" :style="{width: '60%'}">
                <h4>Video Recording</h4>
                <div class="date-label">START TIME</div>
                <VueCtkDateTimePicker 
                  @input="$forceUpdate ()"
                  v-model="meeting_data.async.recording.start_time"
                  id="input1"
                  :min-date="(new Date()).toISOString()"
                  :max-date="meeting_data.async.recording.end_time"  
                />

                  <div class="date-label" :style="{marginTop: '20px'}">END TIME</div>
                  <VueCtkDateTimePicker 
                    @input="$forceUpdate ()"
                    v-model="meeting_data.async.recording.end_time"
                    id="input2"
                    :min-date="meeting_data.async.recording.start_time"
                  />

                  <div class="info-area" :style="{transform: `translateY(18px)`}">
                    Pick the start time and end time in which your students are allowed to watch
                    the recording for attendance. Any student that watches the videos outside of the set
                    times will not be counted in the submissions.
                  </div>

                  <div :class="`video-upload-holder ${meeting_data.async.recording.file != null ? 'active' : ''}`" @click="initiateFileUpload">
                    <div v-if="meeting_data.async.recording.file != null">{{meeting_data.async.recording.file ? meeting_data.async.recording.file.name : ''}}</div>
                    <div v-else>No file selected</div>
                    <div class="small">File format (.mp4, .wav, etc?)</div>
                    <div @click="clearVideoUpload" class="clear" v-if="meeting_data.async.recording.file != null">clear</div>
                    <input type="file" ref="fileUpload1" @change="getUploadedFileBlob" />
                  </div>

              </div>
            </div>
          </transition>
        </div>

        <div class="live-meeting-portion">
          <Button2 
            :style="{marginBottom: '20px', marginRight: '2%'}"
            :onClick="cancelForm"
            :config="{
              width: '8%',
              iconOnly: true,
              icon: 'arrow left',
              color: 'venue-grey'
            }" />
          <Button2 
            :style="{marginBottom: '20px'}"
            text="Create New Meeting"
            :valid="formComplete()"
            :disabled="!formComplete()"
            :onClick="createMeeting"
            :config="{
              width: '50%',
              icon: 'right arrow',
              iconSide: 'right'
            }" />
        </div>

      </div>

    </div>

  <div v-if="meeting_submission_in_progress" class="submission-fullscreen">
    <div class="centerer">
      <v-lottie-player 
        name="QR CODE"
        :animationData="require('@/assets/lottie/uploading.json')"
        loop
        width="300px"
        height="300px"
        autoplay
      />
    </div>
  </div>

  </div>

</template>
<script>
import moment from 'moment'
import InputField2 from '@/components/InputField2.vue'
import Button2 from '@/components/Button2.vue'
import MeetingAPI from '@/services/MeetingAPI'
import CourseAPI from '@/services/CourseAPI'
import OrgAPI from '@/services/OrgAPI'
import {NewMeetingTransform} from '@/modules/MeetingTransform.module'
import VueLottiePlayer from 'vue-lottie-player'

export default {
  name: 'NewMeeting',
  components: {
    InputField2,
    Button2,
    vLottiePlayer: VueLottiePlayer
  },
  data () {
    return {
      live_tasks: [],
      async_tasks: [],
      meeting_data: {},
      has_live: false,
      has_async: false,
      course_org_info: null,
      meeting_submission_in_progress: false
    }
  },
  created () {
    this.meeting_data = {
      meta: {
        title: "",
        start_time: null,
        end_time: null,
        forCourse: false,
        course: null,
        org: null
      },
      live: {
        qr_checkin: {
          start_time: null,
          end_time: null
        }
      },
      async: {
        recording: {
          start_time: null,
          end_time: null,
          file: null
        }
      }
    }

    // load course or org info
    this.getCourseOrgInfo ()
  },
  methods: {
    updateTime () {

    },
    async createMeeting () {
      this.meeting_submission_in_progress = true
      let result = await NewMeetingTransform(this.meeting_data, this.has_live, this.has_async)
      console.log("Result before, ", result)

      // Create New dates for meeting times so meeting times save correctly on the server
      result.start_time = new Date(result.start_time)
      result.end_time = new Date(result.end_time)
      result.qr_checkins.forEach(qr_checkin => {
        qr_checkin.qr_checkin_start_time = new Date(qr_checkin.qr_checkin_start_time)
        qr_checkin.qr_checkin_end_time = new Date(qr_checkin.qr_checkin_end_time)
      })
      result.recordings.forEach(recording => {
        recording.recording_submission_start_time = new Date(recording.recording_submission_start_time)
        recording.recording_submission_end_time = new Date(recording.recording_submission_end_time)
      })

      console.log("Result after, ", result)

      setTimeout(() => {
        // create the meeting
        MeetingAPI.addMeeting(result, 
          this.meeting_data.meta.forCourse,
          this.meeting_data.meta.forCourse ? this.meeting_data.meta.course : this.meeting_data.meta.org
        )
        .then(res => {
          console.log(res)
          this.$router.push({name: 'meeting_info', params: { meeting_id: res.data._id }})
        })
      }, 500)
    },
    getCourseOrgInfo () {
      console.log(this.$route)
      if (this.$route.name == 'course_new_meeting') {
        CourseAPI.getCourse(this.$route.params.course_id)
        .then(res => {
          this.course_org_info = res.data
          this.meeting_data.meta.forCourse = true
          this.meeting_data.meta.course = res.data._id
        })
      }
      else {
        OrgAPI.getOrg(this.$route.params.org_id)
        .then(res => {
          this.course_org_info = res.data
          this.meeting_data.meta.org = res.data._id
        })
      }
    },
    cancelForm () {
      if(this.$route.name === 'course_new_meeting')
        this.$router.push({name: 'course_info', params: {id: this.$route.params.course_id}})
      else
        this.$router.push({name: 'org_info', params: {id: this.$route.params.org_id}})
    },
     initiateFileUpload () {
       let fileUpload = this.$refs.fileUpload1
       fileUpload.click ()
     },
     getUploadedFileBlob () {
       let file = this.$refs.fileUpload1.length == 0 ? null : this.$refs.fileUpload1.files[0]
       if (file) {
         console.log(`File updated to:`)
         console.log(file)
         this.meeting_data.async.recording.file = file
         this.$forceUpdate()
       }
     },
     clearVideoUpload () {
       this.meeting_data.async.recording.file = null
     },
     formComplete () {
       if (this.meeting_data.meta.title == "") return false;
       if (this.has_live) {
        if (this.meeting_data.live.qr_checkin.start_time == null) return false;
        if (this.meeting_data.live.qr_checkin.end_time == null) return false;
        if (this.meeting_data.meta.start_time == null) return false;
        if (this.meeting_data.meta.end_time == null) return false;
       }
       if (this.has_async) {
         if (this.meeting_data.async.recording.start_time == null) return false;
         if (this.meeting_data.async.recording.end_time == null) return false;
         if (this.meeting_data.async.recording.file == null) return false;
       }
       return true;
     }
  }
}
</script>
<style lang="scss">

.light-mode {
  .submission-fullscreen {
    background-color: white;
  }
}

.dark-mode {
  .submission-fullscreen {
    background-color: #121419;
  }
}

.submission-fullscreen {
  position:fixed;
  z-index: 100;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;

  .centerer {
    width: 300px;
    height: 300px;
    margin: 0 auto;
    position: relative;
    top: 25%;
  }
}

.new-meeting-form {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  overflow-y: scroll;

  .form-center {
    width: 1000px;
    margin: 0 auto;
    margin-top: 50px;
    display: flex;
    position: relative;

    .left-side-area {
      width: 250px;
      min-width: 250px;
      text-align: right;
      padding-right: 40px;
      box-sizing: border-box;
      position: fixed;
      top: 50px;
      bottom: 50px;

      .logo-area {
        width: 50px;
        height: 50px;
        display: inline-block;
        background-image: url('~@/assets/venue-logo.svg');
        background-size: 100%;
        margin-bottom: 15px;
      }

      .tasks-list {
        margin-top: 10px;
        margin-bottom: 25px;

        .section-header {
          font-size: 0.85rem;
          margin-bottom: 8px;
          opacity: 0.9;
        }

        .empty-area {
          font-size: 1rem;
          font-style: italic;
        }
      }
    }

    .right-side-area {
      width: 750px;
      transform: translateX(250px);

      .info-area {
        font-size: 0.8rem;
        position: relative;
        top: -8px;
      }

      .new-meeting-title {
        height: 50px;
        margin-bottom: 30px;

        h3 {
          margin: 0;
        }

        .label {
          font-size: 0.8rem;
        }
      }

      .live-meeting-portion {
        margin-top: 30px;
        margin-bottom: 30px;

        .video-upload-holder {
          height: 100px;
          border: 2px dashed #eee;
          margin-top: 30px;
          border-radius: 5px;
          text-align: center;
          padding-top: 30px;
          cursor: pointer;

          .clear {
            text-decoration: underline;
          }

          &.active {
            border: 2px dashed #268ebd;
          }

          input[type=file] {
            display: none;
          }

          .small {
            font-size: 0.7rem;
            opacity: 0.9;
          }
        }

        .checkbox {
          margin-bottom: 5px;
          margin-top: 5px;

          input {
            
          }

          label {
            margin-left: 8px;
            font-size: 0.9rem;
          }
        }

        .meeting-time-picker-area {
          
          .date-label {
            font-size: 0.8rem;
          }
        }
      }
    }
  }

  input.field-input {
    border: 2px solid #47C4FC !important;
    transition: border 0.25s;

    &:focus {
      border: 2px solid #268ebd !important; 
    }
  }

  .time-picker-column-item-effect,
  .datepicker-day.selected .datepicker-day-effect,
  .header-picker {
    background-color: #47C4FC !important;
  }
}

</style>