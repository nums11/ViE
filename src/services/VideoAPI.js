import API from '@/services/API'

export default {
  // GET -----------------
  getVideos() {
    return API().get('videos')
  },
  getVideo(id) {
    return API().get('videos/get/' + id)
  },
  // POST ------------------
  updateVideo(id, video){
    return API().post('videos/update/' + id, {
      updated_video: video
    })
  },
  addVideoSubmission(video_id, submission) {
    return API().post(`videos/add_submission/${video_id}`, {
      submission: submission
    })
  },
  // DELETE -----------------
  deleteVideo(video_id, async_portion_id,
    submission_ids, quiz_id, quiz_question_ids) {
    return API().delete(`videos/delete/${video_id}`, {
      data: {
        async_portion_id: async_portion_id,
        submission_ids: submission_ids,
        quiz_id: quiz_id,
        quiz_question_ids: quiz_question_ids
      }
    })
  },
}
