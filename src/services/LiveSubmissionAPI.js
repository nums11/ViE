import API from '@/services/API'

export default {
  getLiveSubmissions() {
    return API().get('livesubmissions')
  },
  addLiveSubmission(live_submission) {
    return API().post('livesubmissions/add', {
      live_submission: live_submission
    })
  },
  getLiveSubmission(id) {
    return API().get('livesubmissions/get/' + id)
  },
}
