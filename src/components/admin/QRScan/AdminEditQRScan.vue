<template>
  <div>
    <h2>Edit QRScan</h2>
    <div class="spinner-border" role="status" v-if="!qr_scan_has_loaded">
      <span class="sr-only">Loading...</span>
    </div>
    <div v-else>
      <form @submit.prevent="updateQRScan">
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label>Code: </label>
              <input type="text" class="form-control" v-model="qr_scan.code" disabled>
            </div>
          </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label>Start</label>
                <input class="datetime-picker" placeholder="Select date & time"
                id="qr_scan-submission-start"
                v-model="qr_scan.qr_scan_start_time"
                type="datetime-local"/>
                <label>End</label>
                <input class="datetime-picker" placeholder="Select date & time"
                id="qr_scan-submission-start"
                v-model="qr_scan.qr_scan_end_time"
                type="datetime-local"/>
              </div>
            </div>
          </div><br />
          <div class="form-group">
            <button class="btn btn-primary">Update</button>
          </div>
      </form>

      <div class="container">
        <h3 style="text-decoration:underline; margin-top:2rem; font-weight:bold;">QRScan Submissions</h3>
        <div class="attendance-container" v-for="submission in qr_scan.submissions">
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
  import QRScanAPI from '@/services/QRScanAPI.js';

  export default {
    name: 'AdminEditQRScan',
    components: {
    },
    data() {
      return {
        qr_scan: {},
        qr_scan_has_loaded: false,
      }
    },
    created() {
      this.qr_scan_id = this.$route.params.qr_scan_id
      this.getQRScan()
    },
    methods: {
      async getQRScan() {
        const response = await QRScanAPI.getQRScan(this.qr_scan_id)
        this.qr_scan = response.data
        console.log("Got qr_scan", this.qr_scan)
        this.qr_scan_has_loaded = true
      },
      async updateQRScan() {
        let confirmation = confirm("Are you sure you want to update this qr_scan?")
        if(confirmation){
          let updated_qr_scan = {
            qr_scan_start_time: new Date(this.qr_scan.qr_scan_start_time),
            qr_scan_end_time: new Date(this.qr_scan.qr_scan_end_time),
          }
          const response = await QRScanAPI.updateQRScan(this.qr_scan_id, updated_qr_scan)
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