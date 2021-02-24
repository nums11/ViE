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
    <button @click="changeCourseInstructorToArray" disabled>
      Convert course instructor into an array
    </button>
    <button @click="changeNotificationJobInstructorToArray" disabled>
      Convert notification job instructor into an array
    </button>
    <button @click="addQuizzesToRealTimePortions" disabled>
      Add quizzes to real time portions
    </button>
    <button @click="changeCorrectAnswerIndexToArray">
      Change quiz question correct_answer_index to array
    </button>
    <button @click="changeQuizAnswerIndicecsTo2DArray">
      Change submission quiz_answer_indices to 2D array
    </button>
  </div>
</template>

<script>
import MeetingAPI from '@/services/MeetingAPI.js';
import NotificationAPI from '@/services/NotificationAPI.js';
import UserAPI from '@/services/UserAPI.js';
import MigrationAPI from '@/services/MigrationAPI'

export default {
  name: 'AdminMigrations',
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
          await MigrationAPI.changeCourseInstructorToArray()
        alert("Global command completed")
        console.log(response.data)
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong")
      }
    },
    async changeNotificationJobInstructorToArray() {
      try {
        const response = 
          await MigrationAPI.changeNotificationJobInstructorToArray()
        alert("Global command completed")
        console.log(response.data)
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong")
      }
    },
    async addQuizzesToRealTimePortions() {
      try {
        const response = 
          await MigrationAPI.addQuizzesToRealTimePortions()
        alert("Global command completed")
        console.log(response.data)
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong")
      }
    },
    async changeCorrectAnswerIndexToArray() {
      try {
        const response = 
          await MigrationAPI.changeCorrectAnswerIndexToArray()
        alert("Global command completed")
        console.log(response.data)
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong")
      }
    },
    async changeQuizAnswerIndicecsTo2DArray() {
      try {
        const response = 
          await MigrationAPI.changeQuizAnswerIndicecsTo2DArray()
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