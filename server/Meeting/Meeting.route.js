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

meetingRoutes.route('/all').get(function (req, res) {
  Meeting.find().
  populate({
    path: 'course'
  }).
  populate({
    path: 'real_time_portion',
    populate: [{
      path: 'qr_scans',
      populate: {
        path: 'submissions'
      }
    }, {
      path: 'live_polls'
    }]
  }).
  populate({
    path: 'async_portion',
    populate: [{
      path: 'videos',
      populate: {
        path: 'video_submissions'
      }
    }]
  }).
  exec((err, meetings) => {
    if (err || meetings == null) {
      console.log("<ERROR> Getting all meetings")
      res.json(err);
    } else {
      console.log("<Success> Getting all meetings")
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
        path: 'instructor'
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
      path: 'live_polls'
    }]
  }).
  populate({
    path: 'async_portion',
    populate: [{
      path: 'videos',
      populate: {
        path: 'video_submissions',
        populate: {
          path: 'submitter'
        }
      }
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

meetingRoutes.get('/upcoming', function (req, res) {
  Meeting.find().
  populate({
    path: 'course'
  }).
  populate({
    path: 'real_time_portion',
    populate: {
      path: 'qr_scans'
    }
  }).
  exec((error,meetings) => {
    if(error || meetings == null){
      console.log("<ERROR> (meetings/upcoming) Getting meetings",error)
      res.json(error);
    } else {
      let upcoming_meetings = []
      meetings.forEach(meeting => {
        if(meeting.has_real_time_portion && new Date(meeting.start_time) > new Date()) {
          upcoming_meetings.push(meeting)
        }
      })
      console.log("<SUCCESS> (meetings/upcoming) Getting upcoming meetings")
      res.json(upcoming_meetings);
    }
  })
});

// POST ---------------

meetingRoutes.post('/add', async (req, res, next) => {
  const meeting = req.body.meeting
  const real_time_portion = req.body.real_time_portion
  const async_portion = req.body.async_portion
  const instructor_id = req.body.instructor_id
  const repeat_day_indices = req.body.repeat_day_indices
  const repeat_end_date = req.body.repeat_end_date

  try {
    let meeting_creation_promises = []
    meeting_creation_promises.push(MeetingHelper.addMeeting(
      meeting, real_time_portion,async_portion, instructor_id))

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
              new_async_portion, instructor_id))
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

// TODO: Remove reliance on the has_real_time_portion and has_async_portion
// booleans
meetingRoutes.post('/add_video/:meeting_id', async (req, res) => {
  let meeting_id = req.params.meeting_id
  let video = req.body.video
  
  Meeting.findByIdAndUpdate(meeting_id,
    {has_async_portion: true},
    async (error,meeting) => {
    if(error || meeting == null){
      console.log("<ERROR> (meetings/add_video) Getting meeting with ID:",id,error)
      res.json(error);
    } else {
      try {
        let new_video = new Video(video)
        let saved_video = await new_video.save()
        AsyncPortion.findByIdAndUpdate(meeting.async_portion,
          {$push: {videos: saved_video._id}},
          (error,async_portion) => {
            if(error || async_portion == null){
              console.log("<ERROR> (meetings/add_video) Adding video with ID:",
                saved_video._id, "to async_portion with id",
                meeting.async_portion, error)
              res.json(error);
            } else {
              console.log("<SUCCESS> (meetings/add_video) Adding video with ID:",
                saved_video._id, "to async_portion with id",
                meeting.async_portion)
              res.json(saved_video);
            }
          })
      } catch(error) {
        console.log("<ERROR> (meetings/add_video) saving video",
          new_video,error)
        res.json(error);
      }
    }
  })
})

meetingRoutes.post('/add_async_portion', async (req, res) => {
  Meeting.find(async (error, meetings) => {
    if(error || meetings == null) {
      console.log("<ERROR> (meetings/add_async_portion) Getting all meetings", error)
      res.json(error)
    } else {
      let meeting_promises = []
      meetings.forEach(meeting => {
        if(meeting.async_portion == null) {
          meeting_promises.push(new Promise(async (resolve,reject) => {
            let new_async_portion = new AsyncPortion()
            try {
              let saved_async_portion = await new_async_portion.save()
              meeting.async_portion = saved_async_portion
              let saved_meeting = await meeting.save()
              resolve(saved_meeting)
            } catch (error) {
              console.log("<ERROR> (meetings/add_async_portion) saving async_portion and meeting:",
                error)
              res.json(error)
              reject(error)
            }
          }))
        }
      })
      // Attach live attendance to the meeting
      try{
        let saved_meetings = await Promise.all(meeting_promises)
        console.log("<SUCCESS> (meetings/add_async_portion) updating all meetings")
        res.json(saved_meetings)
      } catch(error) {
        console.log("<ERROR> (meetings/add_async_portion) updating all meetings:",error)
        res.json(error)
      }
    }
  })
})

// DELETE --------------

// TODO: remove video video from GCS
// Need to update has async attendance
// For removing video from GCS would have to first ensure that all videos saved have unique names
// (e.g. adding the timestamp)
meetingRoutes.delete('/remove_video/:meeting_id/:async_portion_id/:video_id',
  async function (req, res) {
  let meeting_id = req.params.meeting_id
  let async_portion_id = req.params.async_portion_id
  let video_id = req.params.video_id
  AsyncPortion.findByIdAndUpdate(async_portion_id,
    {$pull: {videos: video_id}},
    {new: true},
    (error,async_portion) => {
      if(error || async_portion == null) {
        console.log("<ERROR (meetings/remove_video)> removing video with id",
          video_id, "from async_portion with id", async_portion_id, error)
        res.json(error)
      }
      Video.findById(video_id, async (error, video) => {
        if(error || video == null) {
          console.log("<ERROR> (meetings/remove_video)> Finding Video with ID:", video_id)
        } else {
          // Delete the video submissions
          let video_submission_promises = []
          video.video_submissions.forEach(submission => {
            let submission_id = submission._id
            video_submission_promises.push(new Promise((resolve,reject) => {
              Submission.findByIdAndRemove(submission_id, (error) => {
                if (error) {
                  console.log("<ERROR (meetings/remove_video)> deleting video submission with ID:",
                    submission_id, error)
                  reject(false)
                  res.json(error);
                } else {
                  resolve(true)
                }
              })
            }))
          })

          try {
            await Promise.all(video_submission_promises)
            Video.findByIdAndRemove(video_id, (err) => {
              if (err) {
                console.log("<ERROR (meetings/remove_video)> Deleting Video with ID:",
                  video_id, err)
                res.json(err);
              } else {
                // Update the meeting's has_async attendance boolean if this was the last video
                if(async_portion.videos.length === 0) {
                  Meeting.findByIdAndUpdate(meeting_id,
                    {has_async_portion: false},
                    (error, meeting) => {
                      if(error || meeting == null) {
                        console.log("<ERROR (meetings/remove_video)> updating meeting with id",
                          meeting_id, error)
                        res.json(error)
                      } else {
                        console.log("<SUCCESS> (meetings/remove_video) Deleting video with ID:",
                          video_id, "and updating async_portion and meeting")
                        res.json('Successfully removed video from meeting');
                      }
                    })
                } else {
                  console.log("<SUCCESS> (meetings/remove_video) Deleting video with ID:",
                    video_id, "and updating async_portion")
                  res.json('Successfully removed video from meeting');
                }
              }
            });
          } catch (error) {
            console.log("<ERROR> (meetings/remove_video) awaiting video submission promise deletion:",error)
            res.json(error)
          }
        }
      })
    }
  )
})

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

module.exports = meetingRoutes;
