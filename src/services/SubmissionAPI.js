import API from '@/services/API'

export default {
  getSubmissions() {
    return API().get('livesubmissions')
  },
  addSubmission(submission) {
    return API().post('livesubmissions/add', {
      submission: submission
    })
  },
  getSubmission(id) {
    return API().get('livesubmissions/get/' + id)
  },
}
