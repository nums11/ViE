import API from '@/services/API'

export default {
  // GET -----------
  getSubmissions() {
    return API().get('submissions')
  },
  getSubmission(id) {
    return API().get(`submissions/get/${id}`)
  },
  // POST -------------
  addSubmission(submission, qr_scan_id) {
    console.log("QR scan id", qr_scan_id)
    return API().post(`submissions/add/${qr_scan_id}`, {
      submission: submission
    })
  },
  updateSubmission(submission_id, submission) {
    return API().post(`submissions/update/${submission_id}`, {
      submission: submission
    })
  }
}
