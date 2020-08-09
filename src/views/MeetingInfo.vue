<template>
  <div>
    <h1>{{ meeting.title }}</h1>
  </div>
</template>

<script>
  import MeetingAPI from '@/services/MeetingAPI.js';

  export default {
    name: 'MeetingInfo',
    components: {

    },
    data(){
      return {
        meeting: {}
      }
    },
    created() {
      this.getMeeting()
    },
    methods: {
      async getMeeting() {
        this.meeting_id = this.$route.params.meeting_id
        const response = await MeetingAPI.getMeeting(this.meeting_id)
        this.meeting = response.data
      }
    }
  }
</script>

<style scoped>

</style>