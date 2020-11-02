<template>
  <div>
    <h2>Notification Jobs</h2>
      <table class="table table-hover">
          <thead>
          <tr>
            <th>Scheduled Time</th>
            <th>Primary Instructor ID</th>
            <th>Secondary Instructor ID</th>
            <th>Meeting ID</th>
          </tr>
          </thead>
          <tbody>
            <tr v-for="notification_job in notification_jobs" :key="notification_job._id">
              <td>{{ new Date(notification_job.scheduled_time) }}</td>
              <td>{{ notification_job.primary_instructor_id }}</td>
              <td>{{ notification_job.secondary_instructor_id }}</td>
              <td>{{ notification_job.meeting_id }}</td>
            </tr>
          </tbody>
      </table>
  </div>
</template>

<script>
  import NotificationAPI from '@/services/NotificationAPI.js';

  export default {
    name: "AdminNotificationJobs",
    data(){
      return {
        notification_jobs: [],
      }
    },
    created() {
      this.getNotificationJobs();
    },
    methods: {
      async getNotificationJobs () {
        const response = await NotificationAPI.getNotificationJobs();
        this.notification_jobs = response.data;
        console.log("Jobs",this.notification_jobs)
      }
    }
  }
</script>