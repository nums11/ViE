<template>
  <div>
    <button @click="addAsyncAttendanceToMeetings">Add Async Attendance to all meetings</button>
    <button @click="notifyAllUsers">Notify all users</button>
  </div>
</template>

<script>
import MeetingAPI from '@/services/MeetingAPI.js';
import NotificationAPI from '@/services/NotificationAPI.js';

export default {
  name: 'AdminGlobalCommands',
  data() {
    return {

    }
  },
  computed: {

  },
  created() {
  },
  methods: {
    async addAsyncAttendanceToMeetings() {
      let confirmation = confirm("Are you sure you want to add async attendance to all meetings?")
      if(confirmation){
        const response = await MeetingAPI.addAsyncAttendanceToMeetings()
        alert("Async attendance successfully added to all meetings")
        console.log(response.data)
      }
    },
    async notifyAllUsers() {
      let confirmation = confirm("Are you sure you want to notify all users?")
      if(confirmation) {
        const response = await NotificationAPI.sendNotification()
        console.log("Notification sent")
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>