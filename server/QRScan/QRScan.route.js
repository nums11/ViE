const express = require('express');
const qrScanRoutes = express.Router ();
const Meeting = require('../Meeting/Meeting.model')
const Course = require('../Course/Course.model')
const QRScan = require('./QRScan.model')
const RealTimePortion = require('../RealTimePortion/RealTimePortion.model')
const Submission = require('../Submission/Submission.model')
const QRScanHelper = require('../helpers/qr_scan_helper')

// DELETE -------------------

qrScanRoutes.delete('/delete/:qr_scan_id',
  async function (req, res, next) {
  const qr_scan_id = req.params.qr_scan_id
  const real_time_portion_id = req.body.real_time_portion_id
  const submission_ids = req.body.submission_ids
  
  try {
    const deletion_status = await QRScanHelper.deleteQRScan(
      qr_scan_id, real_time_portion_id, submission_ids)
    if(deletion_status == false)
      throw "<ERROR> (qr_scans/delete) deleting qr_scan"
    console.log("<SUCCESS> (qr_scans/delete)")
    res.json(true)
  } catch(error) {
    console.log(`<ERROR> (qr_scans/delete) qr_scan_id ${qr_scan_id}`
      + ` real_time_portion_id ${real_time_portion_id}`)
    next(error)
  }
});

module.exports = qrScanRoutes;