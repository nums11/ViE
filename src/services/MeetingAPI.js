import API from '@/services/API'
const fs = require('fs');

export default {
  getAllMeetings() {
    return API().get('meetings/all')
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
  addMeeting(meeting, recurring_end, days) {
    return API().post('meetings/add', {
        meeting: meeting,
        recurring_end: recurring_end,
        days: days,
    })
  },
  addRecordingToMeeting(meeting_id, recording) {
    return API().post(`meetings/add_recording/${meeting_id}`, {
      recording
    })
  },
  removeRecordingFromMeeting(meeting_id, async_attendance_id,recording_id) {
    return API().delete(`meetings/remove_recording/${meeting_id}` +
      `/${async_attendance_id}/${recording_id}`)
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
  addAsyncAttendanceToMeetings() {
    return API().post('meetings/add_async_attendance')
  },
  getUpcomingMeetings() {
    return API().get('meetings/upcoming')
  }
}
