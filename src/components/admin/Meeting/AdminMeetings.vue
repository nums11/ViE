<template>
  <div>
    <h2>Meetings</h2>
    <table class="table table-hover">
      <thead>
      <tr>
        <th>title</th>
        <th>for_course</th>
        <th>course_or_org</th>
        <th>has_live_attendance</th>
        <th>has_async_attendance</th>
      </tr>
      </thead>
      <tbody>
        <tr v-for="meeting in meetings" :key="meeting._id">
          <td>{{ meeting.title }}</td>
          <td>{{ meeting.for_course }}</td>
          <td v-if="meeting.for_course">{{ meeting.course.name }}</td>
          <td v-else>{{ meeting.org.name }}</td>
          <td>{{ meeting.has_live_attendance }}</td>
          <td>{{ meeting.has_async_attendance }}</td>
<!--           <td>
            <router-link :to="{name: 'admin_edit_meeting', params: { id: meeting._id }}" class="btn btn-primary">Edit</router-link>
          </td> -->
          <td>
            <button class="btn btn-danger" @click.prevent="deleteMeeting(meeting)">Delete</button>
          </td>
<!--           <div v-else>
            <td><button class="btn btn-secondary" @click.prevent="$emit('select-meeting', meeting)">Select</button></td>
          </div> -->
        </tr>
      </tbody>
    </table>
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
      this.getMeetings();
    },
    methods: {
      async getMeetings () {
        const response = await MeetingAPI.getMeetings();
        this.meetings = response.data;
      },
      async deleteMeeting(meeting){
        const response = await MeetingAPI.deleteMeeting(meeting);
        this.meetings.splice(this.meetings.findIndex(i => i._id == id), 1);
      },
    }
  }
</script>