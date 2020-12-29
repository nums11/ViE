const express = require('express');
const qrCheckinRoutes = express.Router ();

const Meeting = require('../Meeting/Meeting.model')
const Course = require('../Course/Course.model')
const QRScan = require('./QRScan.model')
const RealTimePortion = require('../RealTimePortion/RealTimePortion.model')
const Submission = require('../Submission/Submission.model')

/*
qrcheckin/attend
@desc Enter a submission for a QR Checkin event for a specified user

@body 
  - user_id:    The id of the user to attend the event for
  - meeting_id: The meeting in which the QR code is attached to
  - qr_code:    The code for the qr checkin to attend the user for

@returns
  - on success => The meeting object in which the user attended 
  - on failure => 
- 
*/

qrCheckinRoutes.route('/get/:id').get(function (req, res) {
  let id = req.params.id;
  QRScan.findById(id).
  populate({
    path: 'submissions',
    populate: {
      path: 'submitter'
    }
  }).
  exec((error,qr_scan) => {
    if(error || qr_scan == null){
      console.log("<ERROR> (qr_scans/get) Getting qr_scan with ID:",id,error)
      res.json(error);
    } else {
      console.log("<SUCCESS> (qr_scans/get) Getting qr_scan by ID:",id)
      res.json(qr_scan);
    }
  })
});

qrCheckinRoutes.route('/update/:id').post(function (req, res) {
  let id = req.params.id;
  let updated_qr_scan = req.body.updated_qr_scan;
  QRScan.findByIdAndUpdate(id,
    {
      qr_scan_start_time: updated_qr_scan.qr_scan_start_time,
      qr_scan_end_time: updated_qr_scan.qr_scan_end_time,
    },
    function (err, qr_scan) {
      if (err || qr_scan == null) {
        console.log("<ERROR> (qr_scans/update) Updating qr_scan by ID:",id,"with:",updated_qr_scan)
        res.status(404).send("qr_scan not found");
      } else {
        console.log("<SUCCESS> (qr_scans/update) Updating qr_scan by ID:",id)
        res.json(qr_scan);
      }
    }
  );
});


qrCheckinRoutes.post('/testSocketQueue', (req, res) => {

  let socketQueue = req.socketQueue
  console.log(socketQueue.getQueue ())
  console.log(socketQueue.getQueue()['5f4268103975e34c2816ac29'])
  res.json({
    test: 'yes',
    socketQueue: socketQueue,
    task: Array.from(socketQueue.getQueue()['5f4268103975e34c2816ac29'])
  })
})

qrCheckinRoutes.post('/attend', async (req, res) => {

  // Get the required body parameters
  let user_id = req.body.user_id
  let meeting_id = req.body.meeting_id
  let qr_code = req.body.qr_code

  let socketQueue = req.socketQueue
  let io = req.socketIO

  if (user_id == null || meeting_id == null || qr_code == null) {
    if (user_id == null) console.log(`<ERROR> (qrcheckin/attend) user_id is not specified`)
    if (meeting_id == null) console.log(`<ERROR> (qrcheckin/attend) meeting_id is not specified`)
    if (qr_code == null) console.log(`<ERROR> (qrcheckin/attend) qr_code is not specified`)
    res.json ({
      success: false,
      error: 'Insufficient parameters'
    })
    return;
  }

  // Check to see if the user with _id = user_id is in the course for the
  // meeting with _id = meeting_id.
  Meeting.findById(meeting_id, async (err, meeting_doc) => {
    if (err || !meeting_doc) {
      // Meeting could not be found.
      res.json({
        success: false,
        error: 'Meeting does not exist.'
      })
    }
    else if (!meeting_doc.has_real_time_portion) {
      console.log(`<ERROR> (qrcheckin/attend) meeting does not have a live attendance in order to submit a qr checkin.`)
      res.json({
        success: false,
        error: 'No live attendance.'
      })
      return;
    }
    else {
      let course_or_org_id = meeting_doc.for_course ? meeting_doc.course : meeting_doc.org

      // checking if the user belongs to the course / org
      let course_org_response;
      course_org_response = await Course.findOne({ _id: course_or_org_id, students: user_id })

      // res.json(course_org_response)
      if (!course_org_response) {
        console.log(`<ERROR> (qrcheckin/attend) no course: found with id (${course_or_org_id}) where student (${user_id}) is part of.`)
        res.json({
          success: false,
          error: 'No course/org found'
        })
        return;
      }
      else {

        // Check to make sure that the qr_code exists within a qr 
        // checkin document that is attached to the live attendance 
        // document for the associated meeting
        let qr_scan = await QRScan.findOne({ code: qr_code })

        if (!qr_scan) {
          console.log(`<ERROR> (qrcheckin/attend) no QRScan for code ${qr_code} could be found.`)
          res.json({
            success: false,
            error: 'No qrcheckin found'
          })
          return;
        }

        else {

          // check to see if the qr_scan is for this meeting
          // res.json(qr_scan)
          let real_time_portion = await RealTimePortion.findOne({ _id: meeting_doc.real_time_portion, qr_scans: qr_scan._id })
          if (!real_time_portion) {
            console.log(`<ERROR> (qrcheckin/attend) invalid live attendance (${meeting_doc.real_time_portion}) associated with meeting (${meeting_id}) for QRScan (${qr_scan._id})`)
            res.json({
              success: false,
              error: 'Invalid live attendance'
            })
            return;
          }

          else {
            
            /* Now that we have confirmed that
                (1) The user is in the course for the meeting and
                (2) The qr code exists and is for this meeting
              
              ... we can mark the user as having attended the qr event!
            */
            
            // Check to make sure there isnt already a submission in this qr
            let existing_submission = await Submission.findOne({ _id: {$in: qr_scan.submissions}, submitter: user_id })
            if (existing_submission) {
              console.log(`<PROMPT> (qrcheckin/attend) User (${user_id}) already attended.`)
              res.json({
                success: false,
                error: 'User has already attended.'
              })
            }
            else {

              // create the live submission
              let new_submission = new Submission({
                submitter: user_id,
                submission_time: new Date(),
                is_qr_scan_submission: true,
                qr_scan: qr_scan._id
              })

              // add the live submission to the qr checkin submission array

              
              let new_submission_doc = await new_submission.save ()
              qr_scan.submissions.push(new_submission_doc._id)
              let new_qr_scan = await qr_scan.save ()
              await QRScan.populate(
                new_qr_scan,
                {
                path: 'submissions',
                populate: {
                  path: 'submitter'
                }
              })

              // get the sockets !!
              let responseSockets = socketQueue.getSockets(new_qr_scan._id)
              
              console.log(new_qr_scan)

              Array.from(responseSockets).forEach(socket_id => {

                io.to(socket_id).emit('attendance update', {
                  data: new_qr_scan.submissions.map(submission => {
                    return submission.submitter
                  })
                })
              })

              // !!!
              res.json({
                success: true,
                data: {
                  new_submission: new_submission_doc,
                  meeting: meeting_doc
                }
              })

            }

          }


        } // end of if(!qr_scan)

      }

    }
  })

})

module.exports = qrCheckinRoutes;