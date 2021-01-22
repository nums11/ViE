import API from '@/services/API'

export default {
  getVideos() {
    return API().get('videos')
  },
  getVideo(id) {
    return API().get('videos/get/' + id)
  },
  updateVideo(id, video){
    return API().post('videos/update/' + id, {
      updated_video: video
    })
  },
  // DELETE -----------------
  deleteVideo(video_id, async_portion_id,
    submission_ids) {
    return API().delete(`videos/delete/${video_id}`, {
      data: {
        async_portion_id: async_portion_id,
        submission_ids: submission_ids
      }
    })
  },
}
