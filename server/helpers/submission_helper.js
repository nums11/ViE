const Submission = require('../Submission/Submission.model');
const QRScan = require('../QRScan/QRScan.model');

module.exports = {addQRSubmission ,deleteSubmissions}

async function addQRSubmission(qr_scan_id, submission) {
  try {
    const new_submission = new Submission(submission)
    const saved_submission = await new_submission.save()
    const update_promise = new Promise((resolve, reject) => {
      QRScan.findByIdAndUpdate(qr_scan_id,
        {$push: {submissions: saved_submission}},
        {new: true}
      ).populate({
      	path: 'submissions',
      	populate: {
      		path: 'submitter'
      	}
      })
      .exec(async (error, qr_scan) => {
          if(error) {
            console.log("<ERROR> (createSubmission) updating qr_scan by id",
              qr_scan_id, "with submission", submission, error)
            reject(error)
          } else if(qr_scan == null) {
            console.log(`<ERROR> (createSubmission) qr_scan with id`,
              ` ${qr_scan_id} not found`)
            reject(null)
          } else {
            resolve(qr_scan)
          }
        }
      )
    })
    const updated_qr_scan = await Promise.resolve(update_promise)
    return updated_qr_scan
  } catch(error) {
    console.log(`<ERROR> (createSubmission) qr_scan_id: ${qr_scan_id}`
      + ` submission`, submission, error)
    return null
  }
} 

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