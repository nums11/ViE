const express = require('express');
const submissionRoutes = express.Router();

let Submission = require('./Submission.model');
let QRScan = require('../QRScan/QRScan.model');
const { response } = require('express');

submissionRoutes.route('/add/:qr_scan_id').post(async function (req, res) {
  const io = req.socketIO
  const socketQueue = req.socketQueue
  const qr_scan_id = req.params.qr_scan_id
  const submission = req.body.submission;

  console.log("qr_scan_id", qr_scan_id)

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

  // try {
  //   let saved_submission = await submission.save()
  //   if(saved_submission.is_qr_scan_submission) {
  //     QRScan.findByIdAndUpdate(saved_submission.qr_scan,
  //       {$push: {submissions: saved_submission._id}},
  //       {new: true},
  //       async (error, qr_scan) => {
  //         if(error || qr_scan == null) {
  //           console.log("<ERROR> (submissions/add) Updating QR checkin with id:",
  //             saved_submission.qr_scan,error)
  //           res.json(error);
  //         } else {
  //           console.log("<SUCCESS> (submissions/add) Adding live submission for QR checkin")

  //           // populating
  //           await QRScan.populate(
  //             qr_scan,
  //             {
  //             path: 'submissions',
  //             populate: {
  //               path: 'submitter'
  //             }
  //           })

  //           // TODO Add to QR live update socket
  //           let responseSockets = socketQueue.getSockets(qr_scan._id)
  //           Array.from(responseSockets).forEach(socket_id => {

  //             let socket_data = qr_scan.submissions.map(submission => {
  //               return submission.submitter
  //             })

  //             io.to(socket_id).emit('attendance update', {
  //               data: socket_data
  //             })

  //             console.log(`<LIVE SUBMISSION/SOCKET> Sent data to ${socket_id}`)
  //           })

  //           res.json(saved_submission);
  //         }
  //       })
  //   } else {
  //     // Poll.findByIdAndUpdate(saved_submission.poll,
  //     //   {$push: {poll_submissions: saved_submission._id}},
  //     //   (error, poll) => {
  //     //     if(error || poll == null) {
  //     //       console.log("<ERROR> (submissions/add) Updating QR checkin with id:",
  //     //         saved_submission.poll,error)
  //     //       res.json(error);
  //     //     } else {
  //     //       console.log("<SUCCESS> (submissions/add) Adding live submission for poll")
  //     //       res.json(saved_submission);
  //     //     }
  //     //   })
  //   }
  // } catch(error) {
  //   console.log("<ERROR> (submissions/add) Adding Live Submission:",
  //     submission,error)
  //   res.json(error);
  // }
});

module.exports = submissionRoutes;