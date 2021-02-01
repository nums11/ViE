const express = require('express');
const submissionRoutes = express.Router();
const Submission = require('./Submission.model');
const SubmissionHelper = require('../helpers/submission_helper');
const QRScan = require('../QRScan/QRScan.model');

submissionRoutes.route('/add/:qr_scan_id').post(
  async function (req, res, next) {
  const qr_scan_id = req.params.qr_scan_id
  const submissions = req.body.submissions;
  try {
    let submission_promises = []
    submissions.forEach(submission => {
      submission_promises.push(new Promise(
        async (resolve, reject) => {
        const updated_qr_scan = await
          SubmissionHelper.addQRSubmission(qr_scan_id, submission)
        if(updated_qr_scan == null)
          reject(null)
        else
          resolve(updated_qr_scan)
      }))
    })
    const updated_qr_scans = await Promise.all(submission_promises)
    console.log("<SUCCESS> (submissions/add)")
    res.json(updated_qr_scans)
  } catch(error) {
    console.log(`<ERROR> (submissions/add) qr_scan_id ${qr_scan_id}`,
      ` submissions`, submissions, error)
    next(error)
  }
});

submissionRoutes.post('/update/:submission_id',
  function (req, res, next) {
  const submission_id = req.params.submission_id
  const submission = req.body.submission
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
        next(error)
      } else if(updated_submission == null) {
        console.log(`<ERROR> (submissions/update) submission with id`
          + ` ${submission_id} not found`)
        res.status(404).json("Submission not found")
      } else {
        console.log("updated submission", updated_submission)
        console.log("<SUCCESS> (submissions/update)")
        res.json(updated_submission)
      }
    }
  )
});

module.exports = submissionRoutes;