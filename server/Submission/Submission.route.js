const express = require('express');
const submissionRoutes = express.Router();
const Submission = require('./Submission.model');
const QRScan = require('../QRScan/QRScan.model');

submissionRoutes.route('/add/:qr_scan_id').post(async function (req, res) {
  const qr_scan_id = req.params.qr_scan_id
  const submission = req.body.submission;

  try {
    const new_submission = new Submission(submission)
    const saved_submission = await new_submission.save()
    const update_promise = new Promise((resolve, reject) => {
      QRScan.findByIdAndUpdate(qr_scan_id,
        {$push: {submissions: saved_submission}},
        {new: true},
        async (error, qr_scan) => {
          if(error || qr_scan == null) {
            console.log("<ERROR> (submissions/add) with qr_scan_id", qr_scan_id,
              "and submission", submission)
            reject(error)
          } else {
            resolve(qr_scan)
          }
        }
      )
    })
    const updated_qr_scan = await Promise.resolve(update_promise)
    console.log("<SUCCESS> (submissions/add)")
    res.json(updated_qr_scan)
  } catch(error) {
    console.log("I got the error ----------------")
    next(error)
  }
});

submissionRoutes.post('/update/:submission_id',
  function (req, res, next) {
  const submission_id = req.params.submission_id
  const submission = req.body.submission
  Submission.findByIdAndUpdate(submission_id,
    {
      furthest_video_time: submission.furthest_video_time,
      video_percent_watched: submission.video_percent_watched
    },
    (error, submission) => {
      if(error) {
        console.log(`<ERROR> (submissions/update) updating submission`
          + ` with id ${submission_id} and submission`, submission)
        next(error)
      } else {
        console.log("<SUCCESS> (submissions/update)")
        res.json(submission)
      }
    }
  )
});

module.exports = submissionRoutes;