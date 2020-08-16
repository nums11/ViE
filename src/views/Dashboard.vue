<template>
  <div class="dashboard-page">

    <div class="instructor-action-row" v-if="current_user.is_instructor">
      <sui-dropdown
        class="labeled
        icon venue-green"
          icon="plus"
          button
          text="Create New Meeting"
        >
        <sui-dropdown-menu>
          
          <sui-dropdown-item><router-link to="/meeting/new/asmple_section_id"><div>Course #1</div></router-link></sui-dropdown-item>
          <sui-dropdown-item><router-link to="/meeting/new/asmple_section_id"><div>Course #2</div></router-link></sui-dropdown-item>
          <sui-dropdown-item><router-link to="/meeting/new/asmple_section_id"><div>Course #3</div></router-link></sui-dropdown-item>
          <sui-dropdown-item><router-link to="/meeting/new/asmple_section_id"><div>Course #4</div></router-link></sui-dropdown-item>
        </sui-dropdown-menu>
      </sui-dropdown>
    </div>
    <div class="dashboard-row-one dashboard-row">
      <div class="dashboard-section">
        <div class="section-title">
          <div class="title-value">Live</div>
          <div class="title-subvalue">4 live courses</div>
        </div>
          <div v-if="!live_loaded">
            <div :style="{marginTop: '30px', marginBottom: '80px'}"><SquareLoader /></div>
          </div>
          <transition
              name="fade"
              mode="out-in"
            >
            <div v-if="live_loaded">
              <MeetingInfoPill
              v-bind:meetingMeta='{
                meetingTitle: "Lecture #1",
                courseDept: "CSCI 1200",
                courseName: "Data Structures"
              }'

                v-bind:tasks='{
                  qrCode: true,
                  poll: true
                }'
              />
            <MeetingInfoPill
              v-bind:meetingMeta='{
                courseDept: "CSCI 1200",
                courseName: "Data Structures"
              }'

              v-bind:tasks='{
                qrCode: true,
                poll: true
              }'
            />
            <MeetingInfoPill
              v-bind:meetingMeta='{
                meetingTitle: "Lecture #1",
                courseDept: "CSCI 1200",
                courseName: "Data Structures"
              }'

              v-bind:tasks='{
                qrCode: true,
              }'
            />
          </div>
        </transition>
      </div>
      <div class="dashboard-section">
      <div class="section-title">
        <div class="title-value">Asynchronous</div>
        <div class="title-subvalue">4 asynchronous courses</div>
      </div>
          <div v-if="!async_loaded">
              <div :style="{marginTop: '30px', marginBottom: '80px'}"><SquareLoader /></div>
          </div>
          <transition
              name="fade"
              mode="out-in"
            >
          <div v-if="async_loaded">
            <MeetingInfoPill
              v-bind:meetingMeta='{
                meetingTitle: "Lecture #1",
                courseDept: "CSCI 1200",
                courseName: "Data Structures"
              }'

              v-bind:tasks='{
                recording: true,
                fileDownload: true
              }'
            />

            <MeetingInfoPill
              v-bind:meetingMeta='{
                meetingTitle: "Lecture #1",
                courseDept: "CSCI 1200",
                courseName: "Data Structures"
              }'

              v-bind:tasks='{
                link: true,
                fileDownload: true
              }'
            />

            <MeetingInfoPill
              v-bind:meetingMeta='{
                meetingTitle: "Lecture #1",
                courseDept: "CSCI 1200",
                courseName: "Data Structures"
              }'

              v-bind:tasks='{
                link: true,
                fileDownload: true,
                recording: true
              }'
            />
          </div>
        </transition>
      </div>
    </div>

  </div>

</template>

<script>

  import SquareLoader from "@/components/Loaders/SquareLoader.vue"
  import MeetingInfoPill from '@/components/MeetingInfoPill.vue'
  import { authComputed } from '../vuex/helpers.js'

  export default {
    name: 'Dashboard',
    computed: {
      ...authComputed
    },
    components: {
      MeetingInfoPill,
      SquareLoader,
    },
    data(){
      return {
        async_loaded: false,
        live_loaded: false
      }
    },
    created() {
      this.getCurrentUser()
      // temporary: set timeout for 3 secionds that data loaded
      setTimeout(() => {
        this.async_loaded = true
      }, 3000)
      setTimeout(() => {
        this.live_loaded = true
      }, 3500)
    },
    methods: {
      getCurrentUser() {
        this.current_user = this.$store.state.user.current_user

        console.log(this.current_user)
      },

      // TODO NUMFOR
      userCourses () {
        /*
        Should return a list of all the courses for the currently logged in user (student/instructor).
        
        */
      },
      liveMeetings () {
        /*
        Should return a list of meetings that have a live attendance component, along with their corresponding
        LiveAttendance component.
        */

      },
      asyncMeetings () {
        /*
        Should return a list of meetings that have an async attendance component, along with their corresponding
        AsyncAttendance component.
        */

      }
    } // end methods
  }
</script>

<style lang="scss">
 
.dashboard-page {
  .instructor-action-row {
    height: 50px;
    vertical-align: bottom;
    display: flex;
    align-items: flex-end;
    margin-bottom: 30px;
  }
}

.dashboard-page .dashboard-row {
  display: flex;
}

.dashboard-page .dashboard-row .dashboard-section {
  width: 50%;
  max-width: 700px;
  margin-bottom: 30px;
  box-sizing: border-box;
  padding-right: 20px;
}

.dashboard-page .dashboard-row .dashboard-section .section-title {
  height: 50px;
  font-weight: 600;
  font-size: 1.2rem;
  display: flex;
}

.dashboard-page .dashboard-row .dashboard-section .section-title .title-value {
  font-weight: 600;
  font-size: 1.2rem;
  margin-right: 20px;
}

.dashboard-page .dashboard-row .dashboard-section .section-title .title-subvalue {
  font-weight: 400;
  font-size: 1rem;
}

@media only screen and (max-width: 900px) {
  .dashboard-page .dashboard-row {
    display: block;
  }

  .dashboard-page .dashboard-row .dashboard-section {
    width: 100%;
    margin-bottom: 30px;
  }
}
</style>
