import API from '@/services/API'

export default {
  getAsyncPortion(id) {
    return API().get(`async_portions/get/${id}`)
  },
  addVideo(async_portion_id, video) {
    return API().post(
    	`async_portions/add_video/${async_portion_id}`, {
    		video: video
    	})
  },
}
