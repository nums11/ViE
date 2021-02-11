const Submission = require('../Submission/Submission.model');
const QRScan = require('../QRScan/QRScan.model');
const Quiz = require('../Quiz/Quiz.model');

module.exports = {addQRSubmission, addQuizSubmission,
  updateSubmission, deleteSubmissions}

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
            console.log("<ERROR> addQRSubmission updating qr_scan by id",
              qr_scan_id, "with submission", submission, error)
            reject(error)
          } else if(qr_scan == null) {
            console.log(`<ERROR> addQRSubmission qr_scan with id`,
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
    console.log(`<ERROR> addQRSubmission qr_scan_id: ${qr_scan_id}`
      + ` submission`, submission, error)
    return null
  }
}

async function addQuizSubmission(quiz_id, submission) {
  try {
    const new_submission = new Submission(submission)
    const saved_submission = await new_submission.save()
    const update_promise = new Promise((resolve, reject) => {
      Quiz.findByIdAndUpdate(quiz_id,
        {$push: {submissions: saved_submission}},
        {new: true}
      ).populate({
        path: 'submissions',
        populate: {
          path: 'submitter'
        }
      })
      .exec(async (error, quiz) => {
          if(error) {
            console.log("<ERROR> addQRSubmission updating quiz by id",
              quiz_id, "with submission", submission, error)
            reject(error)
          } else if(quiz == null) {
            console.log(`<ERROR> addQRSubmission quiz with id`,
              ` ${quiz_id} not found`)
            reject(null)
          } else {
            resolve(quiz)
          }
        }
      )
    })
    const updated_quiz = await Promise.resolve(update_promise)
    return updated_quiz
  } catch(error) {
    console.log(`<ERROR> addQuizSubmission quiz_id: ${quiz_id}`
      + ` submission`, submission, error)
    return null
  }
}

async function updateSubmission(submission_id, submission) {
  try {
    const update_promise = new Promise((resolve, reject) => {
      Submission.findByIdAndUpdate(submission_id,
        {
          quiz_answer_indices: submission.quiz_answer_indices,
          num_correct_answers: submission.num_correct_answers,
          furthest_video_time: submission.furthest_video_time,
          video_percent_watched: submission.video_percent_watched
        },
        {new: true},
        (error, updated_submission) => {
          if(error) {
            console.log(`<ERROR> (submissions/update) updating submission`
              + ` with id ${submission_id} and submission`, submission)
            reject(error)
          } else if(updated_submission == null) {
            console.log(`<ERROR> (submissions/update) submission with id`
              + ` ${submission_id} not found`)
            reject(null)
          } else {
            console.log("<SUCCESS> (submissions/update)")
            resolve(updated_submission)
          }
        }
      )
    })
    const updated_submission = await Promise.resolve(update_promise)
    return updated_submission
  } catch(error) {
    console.log(`<ERROR> (submissions/updateSubmission) submission_id`
      + ` ${submission_id} submission`, submission, error)
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