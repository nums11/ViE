<template>
  <div id="admin-meetings">
    <h2>Meetings</h2>
    <sui-table>
      <sui-table-header>
        <sui-table-row>
          <sui-table-header-cell>Title</sui-table-header-cell>
          <sui-table-header-cell>Course</sui-table-header-cell>
          <sui-table-header-cell># Sections</sui-table-header-cell>
          <sui-table-header-cell>Real-Time Portion</sui-table-header-cell>
          <sui-table-header-cell>Async portion</sui-table-header-cell>
          <sui-table-header-cell>Recurring ID</sui-table-header-cell>
          <sui-table-header-cell>View Meting</sui-table-header-cell>
        </sui-table-row>
      </sui-table-header>
      <sui-table-body>
        <sui-table-row v-for="meeting in meetings">
          <sui-table-cell>{{ meeting.title }}</sui-table-cell>
          <sui-table-cell>{{ meeting.sections[0].course.name }}</sui-table-cell>
          <sui-table-cell>{{ meeting.sections.length }}</sui-table-cell>
          <sui-table-cell v-if="meeting.real_time_portion == null">
            No Real-Time Portion
          </sui-table-cell>
          <sui-table-cell v-else>
            {{ meeting.real_time_portion.qr_scans.length }} QR Scan(s)
          </sui-table-cell>
          <sui-table-cell v-if="meeting.async_portion == null">
            No Async Portion
          </sui-table-cell>
          <sui-table-cell v-else>
            {{ meeting.async_portion.videos.length }} Video(s)
          </sui-table-cell>
          <sui-table-cell>{{ meeting.recurring_id }}</sui-table-cell>
          <sui-table-cell>
            <router-link :to="{name: 'meeting_info',
            params: {meeting_id: meeting._id}}">
              <sui-button color="blue">View Meeting</sui-button>
            </router-link>
          </sui-table-cell>
        </sui-table-row>
      </sui-table-body>
    </sui-table>
  </div>
</template>

<script>
  import MeetingAPI from '@/services/MeetingAPI.js';

  export default {
    name: "AdminMeetings",
    data(){
      return {
        meetings: [],
        // is_meetings_view: false
      }
    },
    created() {
      // this.is_meetings_view = this.$route.name === "admin_meetings"
      this.getAllMeetings();
    },
    methods: {
      async getAllMeetings () {
        const response = await MeetingAPI.getAllMeetings();
        this.meetings = response.data;
      },
      async deleteMeeting(meeting){
        let confirmation = confirm("Are you sure you want to delete this meeting?")
        if(confirmation){
          const response = await MeetingAPI.deleteMeeting(meeting);
          this.$router.go()
        }
      },
    }
  }
</script>

<style scoped>
  #admin-meetings {
    width: 80%;
    margin: auto;
    margin-top: 2rem;
  }
</style>