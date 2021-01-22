const Video = require('../Video/Video.model');
const AsyncPortion = require('../AsyncPortion/AsyncPortion.model');
const SubmissionHelper = require('./submission_helper');

module.exports = {deleteVideo}

async function deleteVideo(video_id, async_portion_id,
	submission_ids) {
	try {
		const async_portion_promise = removeVideoFromAsyncPortion(
			video_id, async_portion_id)
		const submission_promise =
			SubmissionHelper.deleteSubmissions(submission_ids)
		const video_promise = new Promise((resolve, reject) => {
			Video.findByIdAndRemove(video_id,
				(error) => {
					if(error) {
						console.log(`<ERROR> deleteVideo deleting video with`
							+ ` id ${video_id}`, error)
						reject(error)
					} else {
						resolve(true)
					}
				}
			)
		})
		const deletion_promises = await Promise.all([
			async_portion_promise, submission_promise, video_promise])
		if(deletion_promises[0] == null)
			throw "<ERROR> deleteVideo removing qr scan from async_portion"
		if(deletion_promises[1] == false)
			throw "<ERROR> deleteVideo deleting submissions"
		return true
	} catch(error) {
		console.log(`<ERROR> deleteVideo video_id ${video_id}`,
			error)
		return false
	}
}

async function removeVideoFromAsyncPortion(video_id,
	async_portion_id) {
	try {
		const async_portion_promise = new Promise((resolve, reject) => {
			AsyncPortion.findByIdAndUpdate(async_portion_id,
				{$pull: {videos: video_id}},
				(error, async_portion) => {
					if(error) {
						console.log(`<ERROR> removeVideoFromAsyncPortion updating`
							+ ` async_portion with id ${async_portion_id} and`
							+ ` video_id ${video_id}`, error)
						reject(error)
					} else if(async_portion == null) {
						console.log(`<ERROR> removeVideoFromAsyncPortion`
							+ ` async_portion with id ${async_portion_id} not found`)
						reject(null)
					} else {
						resolve(async_portion)
					}
				}
			)
		})
		const updated_async_portion = 
			await Promise.resolve(async_portion_promise)
		return updated_async_portion
	} catch(error) {
		console.log(`<ERROR> removeVideoFromAsyncPortion`
			+ ` video_id ${video_id} async_portion_id `
			+ `${async_portion_id}`, error)
		return null
	}
}