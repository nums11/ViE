import API from '@/services/API'

export default {
  getSubmissions() {
    return API().get('submissions')
  },
  addSubmission(submission, qr_scan_id) {
    console.log("QR scan id", qr_scan_id)
    return API().post(`submissions/add/${qr_scan_id}`, {
      submission: submission
    })
  },
  getSubmission(id) {
    return API().get(`submissions/get/${id}`)
  },
}
