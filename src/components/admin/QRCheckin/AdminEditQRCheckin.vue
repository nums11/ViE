<template>
  <div>
    <h2>Edit QRCheckin</h2>
    <div class="spinner-border" role="status" v-if="!qr_checkin_has_loaded">
      <span class="sr-only">Loading...</span>
    </div>
    <div v-else>
      <form @submit.prevent="updateQRCheckin">
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label>Code: </label>
              <input type="text" class="form-control" v-model="qr_checkin.code" disabled>
            </div>
          </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label>Start</label>
                <input class="datetime-picker" placeholder="Select date & time"
                id="qr_checkin-submission-start"
                v-model="qr_checkin.qr_checkin_start_time"
                type="datetime-local"/>
                <label>End</label>
                <input class="datetime-picker" placeholder="Select date & time"
                id="qr_checkin-submission-start"
                v-model="qr_checkin.qr_checkin_end_time"
                type="datetime-local"/>
              </div>
            </div>
          </div><br />
          <div class="form-group">
            <button class="btn btn-primary">Update</button>
          </div>
      </form>

      <div class="container">
        <h3 style="text-decoration:underline; margin-top:2rem; font-weight:bold;">QRCheckin Submissions</h3>
        <div class="attendance-container" v-for="submission in qr_checkin.qr_checkin_submissions">
          <h4>First Name: {{ submission.submitter.first_name }}</h4>
          <h4>Last Name: {{ submission.submitter.last_name }}</h4>
          <h4>User ID: {{ submission.submitter.user_id }}</h4>
          <h4>Video Percent Watched: {{ submission.video_percent_watched }}</h4>
          <h4>Furthest video time: {{ submission.furthest_video_time }}</h4>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import QRCheckinAPI from '@/services/QRCheckinAPI.js';

  export default {
    name: 'AdminEditQRCheckin',
    components: {
    },
    data() {
      return {
        qr_checkin: {},
        qr_checkin_has_loaded: false,
      }
    },
    created() {
      this.qr_checkin_id = this.$route.params.qr_checkin_id
      this.getQRCheckin()
    },
    methods: {
      async getQRCheckin() {
        const response = await QRCheckinAPI.getQRCheckin(this.qr_checkin_id)
        this.qr_checkin = response.data
        console.log("Got qr_checkin", this.qr_checkin)
        this.qr_checkin_has_loaded = true
      },
      async updateQRCheckin() {
        let confirmation = confirm("Are you sure you want to update this qr_checkin?")
        if(confirmation){
          let updated_qr_checkin = {
            qr_checkin_start_time: new Date(this.qr_checkin.qr_checkin_start_time),
            qr_checkin_end_time: new Date(this.qr_checkin.qr_checkin_end_time),
          }
          const response = await QRCheckinAPI.updateQRCheckin(this.qr_checkin_id, updated_qr_checkin)
          this.$router.go()
        }
      },
    }
  }
</script>

<style scoped>
.attendance-container {
  border: black solid;
  margin-top: 2rem;
  width: 50rem;
}
</style>