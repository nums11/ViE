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
  deleteVideo (id) {
    return API().delete('videos/delete/' + id)
  },
}
