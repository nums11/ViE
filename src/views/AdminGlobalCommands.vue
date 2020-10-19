<template>
  <div>
    <button @click="addAsyncAttendanceToMeetings">Add Async Attendance to all meetings</button>
    <button @click="notifyAllUsers">Notify all users</button>
    <button @click="addServiceWorkerSubscriptionsToUsers">Add service worker subscriptions to users</button>
  </div>
</template>

<script>
import MeetingAPI from '@/services/MeetingAPI.js';
import NotificationAPI from '@/services/NotificationAPI.js';
import UserAPI from '@/services/UserAPI.js';

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
        const response = await NotificationAPI.notifyAllUsers()
        console.log("Notification sent")
      }
    },
    async addServiceWorkerSubscriptionsToUsers() {
      let confirmation = confirm("Are you sure you want to add service worker subscriptions to all users?")
      if(confirmation) {
        const response = await UserAPI.addServiceWorkerSubscriptionsToAllUsers()
        alert("Service worker subscriptions successfully added")
        console.log(response.data)
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>