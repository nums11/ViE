const express = require('express');
const qrCheckinRoutes = express.Router ();

const Meeting = require('../Meeting/Meeting.model')
const Course = require('../Course/Course.model')
const Organization = require('../Organization/Organization.model')
const QRCheckin = require('./QRCheckin.model')
const LiveAttendance = require('../LiveAttendance/LiveAttendance.model')
const LiveSubmission = require('../LiveSubmission/LiveSubmission.model')

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
qrCheckinRoutes.post('/attend', async (req, res) => {

  // Get the required body parameters
  let user_id = req.body.user_id
  let meeting_id = req.body.meeting_id
  let qr_code = req.body.qr_code

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
    else if (!meeting_doc.has_live_attendance) {
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
      if (meeting_doc.for_course) course_org_response = await Course.findOne({ _id: course_or_org_id, students: user_id })
      else                        course_org_response = await Organization.findOne({ _id: course_or_org_id, general_members: user_id })

      // res.json(course_org_response)
      if (!course_org_response) {
        console.log(`<ERROR> (qrcheckin/attend) no ${meeting_doc.for_course ? 'course':'organization'} found with id (${course_or_org_id}) where student (${user_id}) is part of.`)
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
        let qr_checkin = await QRCheckin.findOne({ code: qr_code })

        if (!qr_checkin) {
          console.log(`<ERROR> (qrcheckin/attend) no QRCheckin for code ${qr_code} could be found.`)
          res.json({
            success: false,
            error: 'No qrcheckin found'
          })
          return;
        }

        else {

          // check to see if the qr_checkin is for this meeting
          // res.json(qr_checkin)
          let live_attendance = await LiveAttendance.findOne({ _id: meeting_doc.live_attendance, qr_checkins: qr_checkin._id })
          if (!live_attendance) {
            console.log(`<ERROR> (qrcheckin/attend) invalid live attendance (${meeting_doc.live_attendance}) associated with meeting (${meeting_id}) for QRCheckin (${qr_checkin._id})`)
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
            let existing_submission = await LiveSubmission.findOne({ _id: {$in: qr_checkin.qr_checkin_submissions}, submitter: user_id })
            if (existing_submission) {
              console.log(`<PROMPT> (qrcheckin/attend) User (${user_id}) already attended.`)
              res.json({
                success: false,
                error: 'User has already attended.'
              })
            }
            else {

              // create the live submission
              let new_live_submission = new LiveSubmission({
                submitter: user_id,
                live_submission_time: new Date(),
                is_qr_checkin_submission: true,
                qr_checkin: qr_checkin._id
              })

              // add the live submission to the qr checkin submission array

              
              let new_submission_doc = await new_live_submission.save ()
              qr_checkin.qr_checkin_submissions.push(new_submission_doc._id)
              qr_checkin.save ()
              res.json({
                success: true,
                data: {
                  new_live_submission: new_submission_doc,
                  meeting: meeting_doc
                }
              })

            }

          }


        } // end of if(!qr_checkin)

      }

    }
  })

})

module.exports = qrCheckinRoutes;