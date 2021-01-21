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


meetingRoutes.post('/update/:id', function (req, res) {
  let id = req.params.id;
  let updated_meeting = req.body.updated_meeting;
  Meeting.findByIdAndUpdate(id,
    {
      title: updated_meeting.title,
      start_time: updated_meeting.start_time,
      end_time: updated_meeting.end_time,
    },
    function (err, meeting) {
      if (err || meeting == null) {
        console.log("<ERROR> (meetings/update) Updating meeting by ID:",id,"with:",updated_meeting)
        res.status(404).send("meeting not found");
      } else {
        console.log("<SUCCESS> (meetings/update) Updating meeting by ID:",id)
        res.json(meeting);
      }
    }
  );
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

// TODO: Update routes to use deleteMany
meetingRoutes.delete('/delete/:meeting_id', async function (req, res) {
  let meeting_id = req.params.meeting_id
  let meeting = req.body.meeting

  let meeting_real_time_portion = meeting.real_time_portion
  let qr_submission_promises = []
  let qr_promises = []
  let notification_job_promises = []
  // Delete live attendance
  if(meeting.has_real_time_portion) {
    meeting_real_time_portion.qr_scans.forEach(qr_scan => {
      // Delete qr checkin submissions
      qr_scan.submissions.forEach(submission => {
        let submission_id = submission._id
        qr_submission_promises.push(new Promise((resolve,reject) => {
          Submission.findByIdAndRemove(submission_id, (error) => {
            if (error) {
              console.log("<ERROR (meetings/delete)> deleting QR checkin submission with ID:",
                submission_id, error)
              reject(false)
              res.json(error);
            } else {
              resolve(true)
            }
          })
        }))
      })
      // Delete qr checkin
      let qr_scan_id = qr_scan._id
      qr_promises.push(new Promise((resolve,reject) => {
        QRScan.findByIdAndRemove(qr_scan_id, (error) => {
          if (error) {
            console.log("<ERROR (meetings/delete)> deleting QR checkin with ID:", qr_scan_id,
              error)
            reject(false)
            res.json(error);
          } else {
            resolve(true)
          }
        });
      }))
    })
    // Cancel all notifications for this meeting and delete all NotificationJob objects
    // notification_job_promises.push(new Promise((resolve,reject) => { 
    NotificationJob.find({meeting_id: meeting_id}, (error, meeting_notification_jobs) => {
      if(error || meeting_notification_jobs == null) {
        console.log("<ERROR (meetings/delete)> getting notification jobs for meeting",
          error)
        res.json(error)
      } else {
        meeting_notification_jobs.forEach(notification_job => {
         notification_job_promises.push(new Promise((resolve,reject) => { 
            let global_index = notification_job.global_index
            if(all_notification_jobs[global_index] == null) {
              console.log(`<ERROR> all_notification_jobs[global_index] is null where global_index`
                + `is ${global_index} and all_notification_jobs length is ${all_notification_jobs.length}`)
              console.log("all_notification_jobs", all_notification_jobs)
            } else {
              all_notification_jobs[global_index].cancel()
            }
            let notification_job_id = notification_job._id
            NotificationJob.findByIdAndRemove(notification_job_id, (error) => {
              if(error){
                console.log("<ERROR> (meetings/delete)> deleting notification_job with ID:",
                  notification_job_id)
                reject(false)
              }
              resolve(true)
            }) 
          }))
        })
      }
    })
  }
  // Delete live attendance
  try {
    await Promise.all(qr_submission_promises)
    await Promise.all(qr_promises)
    await Promise.all(notification_job_promises)
    RealTimePortion.findByIdAndRemove(meeting_real_time_portion._id, (err) => {
      if (err) {
        console.log("<ERROR> (meetings/delete)> deleting live attendance with ID:", meeting_real_time_portion._id)
        res.json(err);
      }
    });
  } catch (error) {
    console.log("<ERROR> (meetings/delete) deleting live attendance:",error)
    res.status(500).json(error)
  }

  let meeting_async_portion = meeting.async_portion
  let video_submission_promises = []
  let video_promises = []
  // Delete async attendance
  if(meeting.has_async_portion) {
    meeting_async_portion.videos.forEach(video => {
      // Delete video submissions
      video.video_submissions.forEach(submission => {
        let submission_id = submission._id
        video_submission_promises.push(new Promise((resolve,reject) => {
          Submission.findByIdAndRemove(submission_id, (error) => {
            if (error) {
              console.log("<ERROR (meetings/delete)> deleting video submission with ID:",
                submission_id, error)
              reject(false)
              res.json(error);
            } else {
              resolve(true)
            }
          })
        }))
      })
      // Delete video
      let video_id = video._id
      video_promises.push(new Promise((resolve,reject) => {
        Video.findByIdAndRemove(video_id, (err) => {
          if (err) {
            console.log("<ERROR (meetings/delete)> Deleting QR checkin with ID:", video_id)
            reject(false)
            res.json(err);
          } else {
            resolve(true)
          }
        });
      }))
    })
  }
  // Delete async attendance
  try {
    await Promise.all(video_submission_promises)
    await Promise.all(video_promises)
    AsyncPortion.findByIdAndRemove(meeting_async_portion._id, (err) => {
      if (err) {
        console.log("<ERROR (meetings/delete)> deleting aysnc attendance with ID:", meeting_async_portion._id)
        res.json(err);
      }
    });
  } catch (error) {
    console.log("<ERROR> (meetings/delete) deleting async attendance:",error)
    res.json(error)
  }

  if(meeting.for_course) {

    // Remove this meeting from the courses meetings array
    // as well as the instructor's and students'
    Course.findByIdAndUpdate(meeting.course._id,
      {$pull: {meetings: meeting_id}},
      (error,course) => {
        if(error || course == null) {
          console.log("<ERROR> (meetings/delete) Updating course with id",
            meeting.course_id, err)
          res.json(error);
        } else {
          User.findByIdAndUpdate(course.instructor,
            {$pull: {meetings: meeting_id}},
            async (error, instructor) => {
              if(error || course == null) {
                console.log("<ERROR> (meetings/delete) Updating instructor with id",
                  course.instructor, error)
                res.json(error);
              } else {
                let student_promises = []
                course.students.forEach(student => {
                  student_promises.push(new Promise(async (resolve, reject) => {
                    User.findByIdAndUpdate(student,
                      {$pull: {meetings: meeting_id}},
                      (error, user) => {
                        if(error || user == null) {
                          console.log("<ERROR> (meetings/delete) Updating student with id",
                            student, error)
                          res.json(error);
                        } else {
                          resolve(user)
                        }
                      })
                  }))
                })
                try {
                  await Promise.all(student_promises)
                  if(course.secondary_instructor != null) {
                    User.findByIdAndUpdate(course.secondary_instructor,
                      {$pull: {meetings: meeting_id}},
                      (error, secondary_instructor) => {
                        if(error || secondary_instructor == null) {
                          console.log("<ERROR> (meetings/delete) Updating secondary instructor with id",
                            course.secondary_instructor._id, error)
                          res.json(error);
                        }
                      }
                    )
                  }
                } catch (error) {
                  console.log("<ERROR> (meetings/add) Updating students", error)
                  res.json(error)
                }
              }
            }
          )
        }
      }
    )

  } else {


  }

  // Delete Meeting
  Meeting.findByIdAndRemove(meeting_id, (err) => {
    if (err) {
      console.log("<ERROR> (meetings/delete) Deleting meeting with ID:",meeting_id)
      res.json(err);
    } else {
      console.log("<SUCCESS> (meetings/delete) Deleting meeting with ID:",meeting_id)
      res.json('Successfully removed');
    }
  });
});


module.exports = meetingRoutes;
