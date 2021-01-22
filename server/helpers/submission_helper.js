const Submission = require('../Submission/Submission.model');

module.exports = {deleteSubmissions}

async function deleteSubmissions(submission_ids) {
	try {
		let submission_promises = []
		submission_ids.forEach(submission_id => {
			submission_promises.push(new Promise((resolve,reject) => {
				Submission.findByIdAndRemove(submission_id,
					(error) => {
						if(error) {
							console.log(`<ERROR> deleteSubmissions deleting submission`
								+ ` with id ${submission_id}`, error)
							reject(error)
						} else {
							resolve(true)
						}
					}
				)
			}))
		})
		await Promise.all(submission_promises)
		return true
	} catch(error) {
		console.log("<ERROR> deleteSubmissions submission_ids",
			submission_ids)
		return false
	}
}