import API from '@/services/API'

export default {
  getMeetings() {
    return API().get('meetings')
  },
  addMeeting(meeting) {
    return API().post('meetings/add', {
      meeting: meeting
    })
  },
  getMeeting(id) {
    return API().get('meetings/get/' + id)
  },
  updateMeeting(id, meeting){
    return API().post('meetings/update/' + id, {
      updated_meeting: meeting
    })
  },
  deleteMeeting (id) {
    return API().delete('meetings/delete/' + id)
  },
}
