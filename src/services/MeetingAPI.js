import API from '@/services/API'

export default {
  getMeetings() {
    return API().get('meetings')
  },
  addMeeting(meeting, for_course, course_or_org_id) {
    // Attach the meeting and videos to the form data
    let form_data = new FormData()
    // form_data.append('meeting', meeting)
    if(meeting.has_async_attendance) {
      for(let i = 0; i < meeting.recordings.length; i++) {
        console.log("Appending")
        form_data.append('recording_videos', meeting.recordings[i])
      }
    }
    console.log("Form data",form_data)
    return API().post('meetings/add' + '/' + for_course
      + '/' + course_or_org_id, form_data,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
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
