const express = require('express');
const liveSubmissionRoutes = express.Router();

let LiveSubmission = require('./LiveSubmission.model');
let QRCheckin = require('../QRCheckin/QRCheckin.model');
let Poll = require('../Poll/Poll.model');
const { response } = require('express');

liveSubmissionRoutes.route('/add').post(async function (req, res) {
  let io = req.socketIO
  let socketQueue = req.socketQueue
  let live_submission = new LiveSubmission(req.body.live_submission);

  try {
    let saved_live_submission = await live_submission.save()
    if(saved_live_submission.is_qr_checkin_submission) {
      QRCheckin.findByIdAndUpdate(saved_live_submission.qr_checkin,
        {$push: {qr_checkin_submissions: saved_live_submission._id}},
        async (error, qr_checkin) => {
          if(error || qr_checkin == null) {
            console.log("<ERROR> (live_submissions/add) Updating QR checkin with id:",
              saved_live_submission.qr_checkin,error)
            res.json(error);
          } else {
            console.log("<SUCCESS> (live_submissions/add) Adding live submission for QR checkin")

            // populating
            await QRCheckin.populate(
              saved_live_submission.qr_checkin,
              {
              path: 'qr_checkin_submissions',
              populate: {
                path: 'submitter'
              }
            })

            // TODO Add to QR live update socket
            let responseSockets = socketQueue.getSockets(qr_checkin._id)
            Array.from(responseSockets).forEach(socket_id => {

              let socket_data = saved_live_submission.qr_checkin.qr_checkin_submissions.map(submission => {
                return submission.submitter
              })
              io.to(socket_id).emit('attendance update', {
                data: socket_data
              })

              console.log(`<LIVE SUBMISSION/SOCKET> Sent data to ${socket_id}`)
            })

            res.json(saved_live_submission);
          }
        })
    } else {
      Poll.findByIdAndUpdate(saved_live_submission.poll,
        {$push: {poll_submissions: saved_live_submission._id}},
        (error, poll) => {
          if(error || poll == null) {
            console.log("<ERROR> (live_submissions/add) Updating QR checkin with id:",
              saved_live_submission.poll,error)
            res.json(error);
          } else {
            console.log("<SUCCESS> (live_submissions/add) Adding live submission for poll")
            res.json(saved_live_submission);
          }
        })
    }
  } catch(error) {
    console.log("<ERROR> (live_submissions/add) Adding Live Submission:",
      live_submission,error)
    res.json(error);
  }
});

module.exports = liveSubmissionRoutes;
