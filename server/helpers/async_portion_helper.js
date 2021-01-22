const Video = require('../Video/Video.model');
const AsyncPortion = require('../AsyncPortion/AsyncPortion.model');
const VideoHelper = require('./video_helper');

module.exports = {deleteAsyncPortion}

async function deleteAsyncPortion(async_portion_id,
	meeting_id, videos) {
	try {
		let video_promises = []
		videos.forEach(video => {
			video_promises.push(
				VideoHelper.deleteVideo(video._id, async_portion_id,
					video.submission_ids)
			)
		})
		const async_portion_promise = new Promise((resolve, reject) => {
			AsyncPortion.findByIdAndRemove(async_portion_id,
				(error) => {
					if(error) {
						console.log(`<ERROR> deleting async_portion with id`
							+ ` ${async_portion_id}`, error)
						reject(error)
					} else {
						resolve(true)
					}
				}
			)
		})
		const video_deletion_statuses =
			await Promise.all(video_promises)
		video_deletion_statuses.forEach(status => {
			if(!status)
				throw "<ERROR> deleteAsyncPortion deleting videos"
		})
		await Promise.resolve(async_portion_promise)
		return true
	} catch(error) {
		console.log(`<ERROR> deleteAsyncPortion async_portion_id`
			+ ` ${async_portion_id} meeting_id ${meeting_id}`,
			error)
		return false
	}
}