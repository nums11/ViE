import API from '@/services/API'
const fs = require('fs');

export default {
  getMeetings() {
    return API().get('meetings')
  },
  saveRecordingVideoToGCS(recording) {
    let form_data = new FormData()
    form_data.append('recording', recording)
    return API().post('meetings/save_new_recording/' + recording.name, form_data,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
  },
  // saveRecordingVideosToGCS(recordings) {
  //   // Attach the meeting and videos to the form data
  //   let form_data = new FormData()
  //   for(let i = 0; i < recordings.length; i++) {
  //     form_data.append('recording_videos', recordings[i].video)
  //   }
  //   return API().post('meetings/save_to_gcs', form_data,
  //     {
  //       headers: {
  //         'Content-Type': 'multipart/form-data'
  //       }
  //     }
  //   )
  // },
  addMeeting(meeting, for_course, course_or_org_id) {
    return API().post('meetings/add' + '/' + for_course
      + '/' + course_or_org_id, {
        meeting: meeting
    })
  },
  addRecordingToMeeting(
    meeting_id,
    recording
  ) {

    return API().post(`meetings/update/add_recording/${meeting_id}`, 
    {
      recording
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
  deleteMeeting (meeting) {
    return API().delete('meetings/delete/' + meeting._id, {
      data: {
        meeting: meeting
      }
    })
  },
}
