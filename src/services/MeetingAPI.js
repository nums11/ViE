import API from '@/services/API'
const fs = require('fs');

export default {
  // GET ---------------
  getAllMeetings() {
    return API().get('meetings/all')
  },
  getMeeting(id) {
    return API().get('meetings/get/' + id)
  },
  // POST --------------
  saveVideoToGCS(video) {
    let form_data = new FormData()
    form_data.append('video', video)
    return API().post('meetings/save_new_video/' + video.name, form_data,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
  },
  addMeeting(meeting, real_time_portion,
    async_portion, instructor_id, repeat_day_indices,
    repeat_end_date) {
    return API().post(`meetings/add`, {
        meeting: meeting,
        real_time_portion: real_time_portion,
        async_portion: async_portion,
        instructor_id: instructor_id,
        repeat_day_indices: repeat_day_indices,
        repeat_end_date: repeat_end_date
    })
  },
  addPortion(meeting_id, portion, is_real_time) {
    return API().post(`meetings/add_portion/${meeting_id}`, {
      portion: portion,
      is_real_time: is_real_time
    })
  },
  updateMeeting(meeting_id, meeting){
    return API().post(`meetings/update/${meeting_id}`, {
      meeting: meeting
    })
  },
  // DELETE -------------------
  deleteMeeting (meeting_id, real_time_portion_id, async_portion_id,
    qr_scans, videos) {
    return API().delete(`meetings/delete/${meeting_id}`, {
      data: {
        real_time_portion_id: real_time_portion_id,
        async_portion_id: async_portion_id,
        qr_scans: qr_scans,
        videos: videos
      }
    })
  },
  deleteAllRecurringMeetings(recurring_id) {
    return API().delete(`meetings/delete_all_recurring/`
      + `${recurring_id}`)
  }
}
