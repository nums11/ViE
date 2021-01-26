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
  addQRSubmissions(submissions, qr_scan_id) {
    return API().post(`submissions/add/${qr_scan_id}`, {
      submissions: submissions
    })
  },
  updateSubmission(submission_id, submission) {
    return API().post(`submissions/update/${submission_id}`, {
      submission: submission
    })
  }
}
