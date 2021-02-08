<template>
  <div>
    <button @click="addAsyncPortionToMeetings" disabled>
      Add Async Attendance to all meetings
    </button>
    <button @click="notifyAllUsers" disabled>
      Notify all users
    </button>
    <button @click="addServiceWorkerSubscriptionsToUsers" disabled>
      Add service worker subscriptions to users
    </button>
    <button @click="scheduleJobsForAllUpcomingMeetings" disabled>
      Schedule jobs for all upcoming meetings
    </button>
    <button @click="changeCourseInstructorToArray">
      Convert course instructors into an array
    </button>
  </div>
</template>

<script>
import MeetingAPI from '@/services/MeetingAPI.js';
import NotificationAPI from '@/services/NotificationAPI.js';
import UserAPI from '@/services/UserAPI.js';
import GlobalCommandAPI from '@/services/GlobalCommandAPI'

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
    async addAsyncPortionToMeetings() {
      let confirmation = confirm("Are you sure you want to add async attendance to all meetings?")
      if(confirmation){
        const response = await MeetingAPI.addAsyncPortionToMeetings()
        window.alert("Async attendance successfully added to all meetings")
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
        window.alert("Service worker subscriptions successfully added")
        console.log(response.data)
      }
    },
    async scheduleJobsForAllUpcomingMeetings() {
      let confirmation = confirm("Are you sure you want to schedule jobs for all upcoming meetings?")
      if(confirmation) {
        let response = await MeetingAPI.getUpcomingMeetings()
        let upcoming_meetings = response.data
        console.log("Upcoming meetings", upcoming_meetings)
        upcoming_meetings.forEach(meeting => {
          NotificationAPI.scheduleShowQRNotificationForInstructors(
            meeting.course.instructor, meeting.course.secondary_instructor, meeting._id,
            meeting.real_time_portion.qr_scans[0].qr_scan_start_time)
        })
        window.alert("Scheduled jobs for all upcoming_meetings")
      }
    },
    async changeCourseInstructorToArray() {
      try {
        const response = 
          await GlobalCommandAPI.changeCourseInstructorToArray()
        alert("Global command completed")
        console.log(response.data)
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong")
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>