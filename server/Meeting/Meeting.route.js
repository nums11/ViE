const express = require('express');
const meetingRoutes = express.Router();
const Meeting = require('./Meeting.model');
const RealTimePortion = require('../RealTimePortion/RealTimePortion.model');
const AsyncPortion = require('../AsyncPortion/AsyncPortion.model');
const Submission = require('../Submission/Submission.model');
const QRScan = require('../QRScan/QRScan.model');
const Video = require('../Video/Video.model');
const Course = require('../Course/Course.model');
const User = require('../User/User.model');
const MeetingHelper = require('../helpers/meeting_helper')
const QuizHelper = require('../helpers/quiz_helper')
const {Storage} = require("@google-cloud/storage")
const path = require('path');
const multiparty = require('multiparty')
const moment = require("moment");
// GCS Specific
const storage = new Storage({
  keyFilename: path.join(__dirname, 'venue-279902-649f22aa6e34.json'),
  projectId: "venue-279902"
})
const bucket = storage.bucket('venue_videos')

// GET -----------

meetingRoutes.route('/all').get(
  function (req, res, next) {
  Meeting.find().
  populate({
    path: 'sections',
    populate: {
      path: 'course'
    }
  }).
  populate('real_time_portion').
  populate('async_portion').
  exec((error, meetings) => {
    if (error) {
      console.log("<ERROR> (meetings/all) Getting meetings")
      next(error)
    } else {
      console.log("<Success> (meetings/all) Getting meetings")
      res.json(meetings);
    }
  });
});

meetingRoutes.route('/get/:id').get(function (req, res, next) {
  let id = req.params.id;
  Meeting.findById(id).
  populate({
    path: 'sections',
    populate: [{
      path: 'course',
      populate: {
        path: 'instructors'
      }
    }, {
      path: 'students'
    }]
  }).
  populate({
    path: 'real_time_portion',
    populate: [{
      path: 'qr_scans',
      populate: {
        path: 'submissions',
        populate: {
          path: 'submitter'
        }
      }
    }, {
      path: 'quizzes',
      populate: {
        path: 'submissions',
        populate: {
          path: 'submitter'
        }
      }
    }]
  }).
  populate({
    path: 'async_portion',
    populate: [{
      path: 'videos',
      populate: [{
        path: 'submissions',
        populate: {
          path: 'submitter'
        }
      }, {
        path: 'quiz',
        populate: {
          path: 'questions'
        }
      }]
    }]
  }).
  exec((error,meeting) => {
    if(error){
      next(error);
    } else if(meeting == null) {
      console.log("<ERROR> (meetings/get) Getting meeting by ID", id,
        "meeting not found")
      res.status(404).send(`Meeting with id ${id} not found`)
    } else {
      console.log("<SUCCESS> (meetings/get) Getting meeting by ID:",id)
      res.json(meeting);
    }
  })
});

// POST ---------------

meetingRoutes.post('/add', async (req, res, next) => {
  const meeting = req.body.meeting
  const real_time_portion = req.body.real_time_portion
  const async_portion = req.body.async_portion
  const instructor_ids = req.body.instructor_ids
  const repeat_day_indices = req.body.repeat_day_indices
  const repeat_end_date = req.body.repeat_end_date

  try {
    let meeting_creation_promises = []
    meeting_creation_promises.push(MeetingHelper.addMeeting(
      meeting, real_time_portion, async_portion, instructor_ids))

    // Make the meeting recurring
    if(repeat_end_date != null) {
      // Figure out which portion starts first and start
      // 1 day after that day
      let earliest_start_date =
        MeetingHelper.getEarlierStartDate(real_time_portion,
          async_portion)
      let start = moment(earliest_start_date).add(1, 'days')
      const end = moment(repeat_end_date)

      let i = 1
      while(moment(start).isBefore(end)) {
        // This is one of the days to create a meeting
        if(repeat_day_indices.includes(start.day())) {
          // Does a deep copy
          let new_real_time_portion =
            JSON.parse(JSON.stringify(real_time_portion))
          let new_async_portion =
            JSON.parse(JSON.stringify(async_portion))
          // Create the new real time and async portions adding
          // the number of days iterated so far to the original dates
          if(new_real_time_portion != null) {
            new_real_time_portion.real_time_start =
              moment(real_time_portion.real_time_start).add(i, 'days')
            new_real_time_portion.real_time_end =
              moment(real_time_portion.real_time_end).add(i, 'days')
            new_real_time_portion.qr_scans.forEach(qr_scan => {
              if(qr_scan.reminder_time != null) {
                qr_scan.reminder_time =
                  moment(qr_scan.reminder_time).add(i, 'days')
              }
            })
          }
          if(new_async_portion != null) {
            new_async_portion.async_start =
              moment(async_portion.async_start).add(i, 'days')
            new_async_portion.async_end =
              moment(async_portion.async_end).add(i, 'days')
          }
          meeting_creation_promises.push(
            MeetingHelper.addMeeting(meeting, new_real_time_portion,
              new_async_portion, instructor_ids))
        }
        i++
        start.add(1, 'days')
      }
    }

    const saved_meetings =
      await Promise.all(meeting_creation_promises)
    saved_meetings.forEach(meeting => {
      if(meeting == null)
        throw "<ERROR> (meetings/add) saving meetings"
    })
    if(repeat_end_date != null) {
      const meetings_with_recurring_ids = 
        await MeetingHelper.setRecurringIds(saved_meetings)
      if(meetings_with_recurring_ids == null)
        throw "<ERROR> (meetings/add) setting recurring ids"
    }
    console.log("<SUCCESS> (meetings/add)")
    res.json(saved_meetings)
  } catch(error) {
    next(error)
  }
});

meetingRoutes.post('/save_new_video/:video_name', (req, res) => {
  let video_name = req.params.video_name
  const blob = bucket.file(video_name.replace(/ /g, "_"))
  console.log("Instantiated blob with name", blob.name)
  var form = new multiparty.Form()

  form.on('error', (err) => {
    console.log("<ERROR> (meetings/save_new_video) form error", err)
    res.status(500).json(err)
  })

  form.on('close', () => {
    console.log("<SUCCESS> (meetings/save_new_video) saving video")
    const publicUrl = 'https://storage.googleapis.com/' + bucket.name + '/' + blob.name
    res.json(publicUrl)
  })

  form.on('part', function(part) {
    console.log("(meetings/save_new_video) received part of size", part.byteCount)
    part.pipe(
      blob.createWriteStream({
          resumable: false,
          timeout: 600000 //10 minutes
      })
    )
    // part.resume()
    part.on('error', (err)=> {
      console.log("<ERROR> (meetings/save_new_video) part error", err)
    })
  })

  form.parse(req)
})

meetingRoutes.post('/add_portion/:meeting_id',
  async (req, res, next) => {
  const meeting_id = req.params.meeting_id
  const portion = req.body.portion
  const is_real_time = req.body.is_real_time

  try {
    let saved_portion;
    let update_block;
    if(is_real_time) {
      saved_portion =
        await (new RealTimePortion(portion)).save()
      update_block = {real_time_portion: saved_portion}
    } else {
      saved_portion =
        await (new AsyncPortion(portion)).save()
        update_block = {async_portion: saved_portion}
    }

    Meeting.findByIdAndUpdate(meeting_id, update_block,
      {new: true},
      (error, updated_meeting) => {
        if(error) {
          console.log(`<ERROR> (meetings/add_portion) updating meeting`
            + ` with id ${meeting_id} update_block`, update_block)
          next(error)
        } else if(updated_meeting == null) {
          console.log(`<ERROR> (meetings/add_portion) could not find`
            + ` meeting with id ${meeting_id}`)
          res.status(404).json("Meeting not found")
        } else {
          console.log("<SUCCESS> (meetings/add_portion)")
          res.json(saved_portion)
        }
      }
    )

  } catch(error) {
    console.log(`<ERROR> (meetings/add_portion) meeting_id ${meeting_id}`
      + ` portion`,portion,`is_real_time ${is_real_time}`)
    next(error)
  }
})

meetingRoutes.post('/update/:meeting_id',
  async function (req, res, next) {
  const meeting_id = req.params.meeting_id;
  const meeting = req.body.meeting;
  try {
    const updated_values = await MeetingHelper.updateMeeting(
      meeting_id, meeting)
    if(updated_values == null)
      throw "<ERROR> (meetings/update) updating values"
    res.json(updated_values)
  } catch(error) {
    console.log(`<ERROR> (meetings/update) meeting_id ${meeting_id}`
      + ` meeting`, meeting)
    next(error)
  }
});

// DELETE --------------

meetingRoutes.delete('/delete/:meeting_id',
  async function(req, res, next) {
  const meeting_id = req.params.meeting_id
  const real_time_portion_id = req.body.real_time_portion_id
  const async_portion_id = req.body.async_portion_id
  const qr_scans = req.body.qr_scans
  const videos = req.body.videos

  try {
    const deletion_status = await MeetingHelper.deleteMeeting(
      meeting_id, real_time_portion_id, async_portion_id,
      qr_scans, videos)
    if(!deletion_status)
      throw "<ERROR> (meetings/delete) deleting meeting"
    console.log("<SUCCESS> (meetings/delete)")
    res.json(true)
  } catch(error) {
    console.log(`<ERROR> (meetings/delete) meeting_id ${meeting_id}`)
  }
})

meetingRoutes.delete('/delete_all_recurring/:recurring_id',
  async function(req, res, next) {
  const recurring_id = req.params.recurring_id

  try {
    let recurring_meetings =
      await MeetingHelper.getRecurringMeetings(recurring_id)
    if(recurring_meetings == null) {
      throw "<ERROR> (meetings/delete_all_recurring) getting"
        + " recurring meetings"
    }
    let meeting_promises = []
    recurring_meetings.forEach(meeting => {
      meeting_promises.push(new Promise(
        async (resolve, reject) => {
        let real_time_portion_id = null
        let qr_scans = []
        if(meeting.real_time_portion != null) {
          real_time_portion_id = meeting.real_time_portion._id
          let meeting_qr_scans = meeting.real_time_portion.qr_scans
          meeting_qr_scans.forEach(qr_scan => {
            qr_scans.push({
              _id: qr_scan._id,
              submission_ids: qr_scan.submissions
            })
          })
        }
        let async_portion_id = null
        let videos = []
        if(meeting.async_portion != null) {
          async_portion_id = meeting.async_portion._id
          let meeting_videos = meeting.async_portion.videos
          meeting_videos.forEach(video => {
            let quiz_id = null, quiz_question_ids = []
            if(video.quiz != null) {
              quiz_id = video.quiz._id
              quiz_question_ids = QuizHelper.getQuizQuestionIds(
                video.quiz)
            }
            videos.push({
              _id: video._id,
              submission_ids: video.submissions,
              quiz_id: quiz_id,
              quiz_question_ids: quiz_question_ids
            })
          })
        }
        try {
          const deletion_status = await MeetingHelper.deleteMeeting(
            meeting._id, real_time_portion_id, async_portion_id,
            qr_scans, videos)
          if(deletion_status)
            resolve(true)
          else {
            console.log("<ERROR> (meetings/delete_all_recurring)"
              + " deleting meeting", meeting)
            reject(false)
          }
        } catch(error) {
          console.log("<ERROR> (meetings/delete_all_recurring)"
            + " deleting meeting", error)
          reject(error)
        }
      }))
    })
    await Promise.all(meeting_promises)
    console.log("<SUCCESS> (meetings/delete_all_recurring)")
    res.json(true)
  } catch(error) {
    console.log(`<ERROR> (meetings/delete_all_recurring) `
      + `recurring_id ${recurring_id}`)
    next(error)
  }
})

module.exports = meetingRoutes;
