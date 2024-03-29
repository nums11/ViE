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
  async function (req, res, next) {
  const submission_id = req.params.submission_id
  const submission = req.body.submission
  try {
    const updated_submission =
      await SubmissionHelper.updateSubmission(submission_id, submission)
    if(updated_submission == null)
      throw "<ERROR> updating submission"
    res.json(updated_submission)
  } catch(error) {
    console.log(`<ERROR> (submissions/update) submission_id`
      + ` submission_id submission`, submission, error)
    next(error)
  }
});

module.exports = submissionRoutes;