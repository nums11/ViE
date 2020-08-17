import API from '@/services/API'

export default {
  getAsyncSubmissions() {
    return API().get('asyncsubmissions')
  },
  addAsyncSubmission(async_submission) {
    return API().post('asyncsubmissions/add', {
      async_submission: async_submission
    })
  },
  getAsyncSubmission(id) {
    return API().get('asyncsubmissions/get/' + id)
  },
  updateAsyncSubmission(id, async_submission) {
    return API().post('asyncsubmissions/update/' + id, {
      async_submission: async_submission
    })
  },
}
