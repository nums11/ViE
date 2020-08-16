import API from '@/services/API'

export default {
  getMeetings() {
    return API().get('meetings')
  },
  saveRecordingVideosToGCS(recordings) {
    // Attach the meeting and videos to the form data
    let form_data = new FormData()
    for(let i = 0; i < recordings.length; i++) {
      form_data.append('recording_videos', recordings[i].video)
    }
    return API().post('meetings/save_to_gcs', form_data,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
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
