import API from '@/services/API'

export default {
	// GET -------------------
  getAsyncPortion(id) {
    return API().get(`async_portions/get/${id}`)
  },
  // POST -------------------
  addVideo(async_portion_id, video) {
    return API().post(
    	`async_portions/add_video/${async_portion_id}`, {
    		video: video
    	})
  },
  // DELETE -----------------
  deleteAsyncPortion(async_portion_id, meeting_id,
  	videos) {
  	return API().delete(
  		`async_portions/delete/${async_portion_id}`, {
  			data: {
  				meeting_id: meeting_id,
  				videos: videos
  			}
  		})
  }
}
