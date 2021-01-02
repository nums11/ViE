import API from '@/services/API'
const fs = require('fs');

export default {
  getAllMeetings() {
    return API().get('meetings/all')
  },
  saveVideoVideoToGCS(video) {
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
  // saveVideoVideosToGCS(videos) {
  //   // Attach the meeting and videos to the form data
  //   let form_data = new FormData()
  //   for(let i = 0; i < videos.length; i++) {
  //     form_data.append('video_videos', videos[i].video)
  //   }
  //   return API().post('meetings/save_to_gcs', form_data,
  //     {
  //       headers: {
  //         'Content-Type': 'multipart/form-data'
  //       }
  //     }
  //   )
  // },
  addMeeting(title, real_time_portion, num_qr_scans, async_portion,
    sections) {
    return API().post(`meetings/add`, {
        title: title,
        real_time_portion: real_time_portion,
        num_qr_scans: num_qr_scans,
        async_portion: async_portion,
        sections: sections
    })
  },
  addVideoToMeeting(meeting_id, video) {
    return API().post(`meetings/add_video/${meeting_id}`, {
      video
    })
  },
  removeVideoFromMeeting(meeting_id, async_portion_id,video_id) {
    return API().delete(`meetings/remove_video/${meeting_id}` +
      `/${async_portion_id}/${video_id}`)
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
  addAsyncPortionToMeetings() {
    return API().post('meetings/add_async_portion')
  },
  getUpcomingMeetings() {
    return API().get('meetings/upcoming')
  }
}
