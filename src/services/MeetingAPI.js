import API from '@/services/API'

export default {
  getMeetings() {
    return API().get('meetings')
  },
  addMeeting(meeting, for_course, course_or_org_id) {
    return API().post('meetings/add' + '/' + for_course
      + '/' + course_or_org_id, {
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
