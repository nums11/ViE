const express = require('express');
const realTimePortionRoutes = express.Router();
const RealTimePortion = require('../RealTimePortion/RealTimePortion.model');
const QRScan = require('../QRScan/QRScan.model');
const QRScanHelper = require('../helpers/qr_scan_helper')
const QuizHelper = require('../helpers/quiz_helper')
const RealTimePortionHelper = require('../helpers/real_time_portion_helper')
const NotificationHelper = require('../helpers/notification_helper')

// POST -------------

realTimePortionRoutes.post('/add_qr_scan/:real_time_portion_id',
  async function(req, res, next) {
  const real_time_portion_id = req.params.real_time_portion_id
  const qr_scan = req.body.qr_scan
  const meeting_id = req.body.meeting_id
  const instructor_ids = req.body.instructor_ids

  try {
    const new_qr_scan = new QRScan(qr_scan)
    new_qr_scan.code = QRScanHelper.generateRandomCode()
    const saved_qr_scan = await new_qr_scan.save()
    RealTimePortion.findByIdAndUpdate(real_time_portion_id,
      {$push: {qr_scans: saved_qr_scan}},
      {new: true},
      (error, updated_real_time_portion) => {
        if(error) {
          console.log(`<ERROR> (real_time_portions/add_qr_scan)`,
            ` updating real_time_portion with id ${real_time_portion_id}`,
            ` with qr_scan`, qr_scan)
          next(error)
        } else if(updated_real_time_portion == null) {
          console.log(`<ERROR> (real_time_portions/add_qr_scan) could not`,
            + ` find real_time_portion with id ${real_time_portion_id}`)
          res.status(404).json("real_time_portion not found")
        } else {
          if(saved_qr_scan.reminder_time != null) {
            NotificationHelper.scheduleShowQRNotification(
              saved_qr_scan.reminder_time, instructor_ids,
              meeting_id, saved_qr_scan._id)
          }
          console.log("<SUCCESS> (real_time_portions/add_qr_scan)")
          res.json(saved_qr_scan)
        }
      }
    )
  } catch(error) {
    console.log(`<ERROR> (real_time_portions/add_qr_scan)`
      + ` real_time_portion_id: ${real_time_portion_id}`
      + ` qr_scan`, qr_scan)
    next(error)
  }
})

realTimePortionRoutes.post('/add_quiz/:real_time_portion_id',
  async function(req, res, next) {
  const real_time_portion_id = req.params.real_time_portion_id
  const quiz = req.body.quiz

  try {
    const saved_quiz = await QuizHelper.createQuiz(quiz)
    if(saved_quiz == null)
      throw "<ERROR> saving quiz"

    RealTimePortion.findByIdAndUpdate(real_time_portion_id,
      {$push: {quizzes: saved_quiz._id}},
      {new: true},
      (error, updated_real_time_portion) => {
        if(error) {
          console.log(`<ERROR> (real_time_portions/add_quiz)`,
            ` updating real_time_portion with id ${real_time_portion_id}`,
            ` with quiz`, saved_quiz)
          next(error)
        } else if(updated_real_time_portion == null) {
          console.log(`<ERROR> (real_time_portions/add_quiz) could not`,
            + ` find real_time_portion with id ${real_time_portion_id}`)
          res.status(404).json("real_time_portion not found")
        } else {
          console.log("<SUCCESS> (real_time_portions/add_quiz)")
          res.json(saved_quiz)
        }
      }
    )
  } catch(error) {
    console.log(`<ERROR> (real_time_portions/add_quiz)`
      + ` real_time_portion_id: ${real_time_portion_id}`
      + ` quiz`, quiz)
    next(error)
  }
})

// DELETE -------------

realTimePortionRoutes.delete('/delete/:real_time_portion_id',
  async function(req, res, next) {
  const real_time_portion_id = req.params.real_time_portion_id
  const meeting_id = req.body.meeting_id
  const qr_scans = req.body.qr_scans

  try {
    const deletion_status = await RealTimePortionHelper.deleteRealTimePortion(
      real_time_portion_id, meeting_id, qr_scans)
    if(!deletion_status)
      throw "<ERROR> (real_time_portions/delete) deleting real_time_portion"
    console.log("<SUCCESS> (real_time_portions/delete)")
    res.json(true)
  } catch(error) {
    console.log(`<ERROR> (real_time_portions/delete) real_time_portion_id`
      + ` ${real_time_portion_id} meeting_id ${meeting_id}`)
    next(error)
  }
})

module.exports = realTimePortionRoutes;
