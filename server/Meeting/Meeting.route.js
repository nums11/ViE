const express = require('express');
const moment = require("moment");
const meetingRoutes = express.Router();

let Meeting = require('./Meeting.model');
let LiveAttendance = require('../LiveAttendance/LiveAttendance.model');
let AsyncAttendance = require('../AsyncAttendance/AsyncAttendance.model');
let LiveSubmission = require('../LiveSubmission/LiveSubmission.model');
let AsyncSubmission = require('../AsyncSubmission/AsyncSubmission.model');
let QRCheckin = require('../QRCheckin/QRCheckin.model');
let Recording = require('../Recording/Recording.model');
let Course = require('../Course/Course.model');
let Org = require('../Organization/Organization.model');
let Poll = require('../Poll/Poll.model');
let User = require('../User/User.model');
let Section = require('../Section/Section.model');
const NotificationJob = require('../Notification/NotificationJob.model');
const {Storage} = require("@google-cloud/storage")
const path = require('path');
// var multer = require("multer")
// var upload = multer({ storage: multer.memoryStorage() })
var multiparty = require('multiparty');
const { start } = require('repl');

// GCS Specific

const storage = new Storage({
  keyFilename: path.join(__dirname, 'venue-279902-649f22aa6e34.json'),
  projectId: "venue-279902"
})

const bucket = storage.bucket('venue_videos')

const uploadVideoToGCS = (file) => new Promise((resolve, reject) => {
  const { originalname, buffer } = file
  const blob = bucket.file(originalname.replace(/ /g, "_"))
  const blobStream = blob.createWriteStream({
    resumable: false
  })
  blobStream.on('finish', () => {
    const publicUrl = 'https://storage.googleapis.com/' + bucket.name + '/' + blob.name
    resolve(publicUrl)
  })
  .on('error', (err) => {
    reject(`Unable to upload video, something went wrong` + err)
  })
  .end(buffer)
})

meetingRoutes.post('/save_new_recording/:recording_name', (req, res) => {
  let recording_name = req.params.recording_name
  const blob = bucket.file(recording_name.replace(/ /g, "_"))
  console.log("Instantiated blob with name", blob.name)
  var form = new multiparty.Form()

  form.on('error', (err) => {
    console.log("<ERROR> (meetings/save_new_recording) form error", err)
    res.status(500).json(err)
  })

  form.on('close', () => {
    console.log("<SUCCESS> (meetings/save_new_recording) saving video")
    const publicUrl = 'https://storage.googleapis.com/' + bucket.name + '/' + blob.name
    res.json(publicUrl)
  })

  form.on('part', function(part) {
    console.log("(meetings/save_new_recording) received part of size", part.byteCount)
    part.pipe(
      blob.createWriteStream({
          resumable: false,
          timeout: 600000 //10 minutes
      })
    )
    // part.resume()
    part.on('error', (err)=> {
      console.log("<ERROR> (meetings/save_new_recording) part error", err)
    })
  })

  form.parse(req)
})

// meetingRoutes.post('/save_to_gcs',
//   upload.array('recording_videos'), async (req, res) => {
//     let videos = req.files
//     let video_promises = []
//     videos.forEach(video => {
//       video_promises.push(new Promise(async (resolve,reject) => {
//         try {
//           let video_gcs_url = await uploadVideoToGCS(video)
//           resolve(video_gcs_url)
//         } catch (error) {
//           console.log("<ERROR> (meetings/save_to_gcs) saving video to GCS:",video,error)
//           res.json(error)
//         }
//       }))
//     })
//     try{
//       let saved_video_urls = await Promise.all(video_promises)
//       res.json(saved_video_urls)
//     } catch(error) {
//       console.log("<ERROR> (meetings/save_to_gcs) saving videos to GCS:",error)
//       res.json(error)
//     }
//   }
// )

// TODO: Update the secondary instructor's meetings as well
meetingRoutes.post('/add', async (req, res) => {
  const day = 86400000;
  let meeting = req.body.meeting;
  let recurring_end = new Date(req.body.recurring_end);
  recurring_end.setTime(recurring_end.getTime() + day);
  let qr_checkins = meeting.qr_checkins;
  let days = req.body.days;
  let first = await addMeeting(res, meeting);
  let d = moment(first.start_time).add(1, 'days');
  if(recurring_end != null && days != null){
    for (var i = 1; d <= recurring_end; i++, d.add(1, 'days')) {
      if (days.includes(d.day())){
        meeting.start_time = moment(d);
        meeting.end_time = moment(first.end_time).add(i, 'days');
        meeting.qr_checkins = [];
        qr_checkins.forEach(checkin => {
          let new_checkin = new QRCheckin();
          new_checkin.qr_checkin_start_time = checkin.qr_checkin_start_time + day * i;
          new_checkin.qr_checkin_end_time = checkin.qr_checkin_end_time + day * i;
          new_checkin.code = generateRandomCode();
          meeting.qr_checkins.push(new_checkin);
        });
        meeting.recurring_id = first._id;
        addMeeting(res, meeting);
      }
    }
  }
  res.json(first);
});

meetingRoutes.route('/all').get(function (req, res) {
  Meeting.find().
  populate({
    path: 'course'
  }).
  populate({
    path: 'org'
  }).
  populate({
    path: 'live_attendance',
    populate: [{
      path: 'qr_checkins',
      populate: {
        path: 'qr_checkin_submissions'
      }
    }, {
      path: 'live_polls'
    }]
  }).
  populate({
    path: 'async_attendance',
    populate: [{
      path: 'recordings',
      populate: {
        path: 'recording_submissions'
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

meetingRoutes.route('/get/:id').get(function (req, res) {
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
    path: 'org',
    populate: [{
      path: 'general_members'
    }, {
      path: 'board_members'
    }]
  }).
  populate({
    path: 'live_attendance',
    populate: [{
      path: 'qr_checkins',
      populate: {
        path: 'qr_checkin_submissions',
        populate: {
          path: 'submitter'
        }
      }
    }, {
      path: 'live_polls'
    }]
  }).
  populate({
    path: 'async_attendance',
    populate: [{
      path: 'recordings',
      populate: {
        path: 'recording_submissions',
        populate: {
          path: 'submitter'
        }
      }
    }]
  }).
  exec((error,meeting) => {
    if(error || meeting == null){
      console.log("<ERROR> (meetings/get) Getting meeting with ID:",id,error)
      res.json(error);
    } else {
      console.log("<SUCCESS> (meetings/get) Getting meeting by ID:",id)
      res.json(meeting);
    }
  })
});

meetingRoutes.route('/update/:id').post(function (req, res) {
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

// TODO: Remove reliance on the has_live_attendance and has_async_attendance
// booleans
meetingRoutes.route('/add_recording/:meeting_id').post(async (req, res) => {
  let meeting_id = req.params.meeting_id
  let recording = req.body.recording
  
  Meeting.findByIdAndUpdate(meeting_id,
    {has_async_attendance: true},
    async (error,meeting) => {
    if(error || meeting == null){
      console.log("<ERROR> (meetings/add_recording) Getting meeting with ID:",id,error)
      res.json(error);
    } else {
      try {
        let new_recording = new Recording(recording)
        let saved_recording = await new_recording.save()
        AsyncAttendance.findByIdAndUpdate(meeting.async_attendance,
          {$push: {recordings: saved_recording._id}},
          (error,async_attendance) => {
            if(error || async_attendance == null){
              console.log("<ERROR> (meetings/add_recording) Adding recording with ID:",
                saved_recording._id, "to async_attendance with id",
                meeting.async_attendance, error)
              res.json(error);
            } else {
              console.log("<SUCCESS> (meetings/add_recording) Adding recording with ID:",
                saved_recording._id, "to async_attendance with id",
                meeting.async_attendance)
              res.json(saved_recording);
            }
          })
      } catch(error) {
        console.log("<ERROR> (meetings/add_recording) saving recording",
          new_recording,error)
        res.json(error);
      }
    }
  })
})

// TODO: remove recording video from GCS
// Need to update has async attendance
// For removing video from GCS would have to first ensure that all videos saved have unique names
// (e.g. adding the timestamp)
meetingRoutes.route('/remove_recording/:meeting_id/:async_attendance_id/:recording_id').
delete(async function (req, res) {
  let meeting_id = req.params.meeting_id
  let async_attendance_id = req.params.async_attendance_id
  let recording_id = req.params.recording_id
  AsyncAttendance.findByIdAndUpdate(async_attendance_id,
    {$pull: {recordings: recording_id}},
    {new: true},
    (error,async_attendance) => {
      if(error || async_attendance == null) {
        console.log("<ERROR (meetings/remove_recording)> removing recording with id",
          recording_id, "from async_attendance with id", async_attendance_id, error)
        res.json(error)
      }
      Recording.findById(recording_id, async (error, recording) => {
        if(error || recording == null) {
          console.log("<ERROR> (meetings/remove_recording)> Finding Recording with ID:", recording_id)
        } else {
          // Delete the recording submissions
          let recording_submission_promises = []
          recording.recording_submissions.forEach(submission => {
            let submission_id = submission._id
            recording_submission_promises.push(new Promise((resolve,reject) => {
              AsyncSubmission.findByIdAndRemove(submission_id, (error) => {
                if (error) {
                  console.log("<ERROR (meetings/remove_recording)> deleting recording submission with ID:",
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
            await Promise.all(recording_submission_promises)
            Recording.findByIdAndRemove(recording_id, (err) => {
              if (err) {
                console.log("<ERROR (meetings/remove_recording)> Deleting Recording with ID:",
                  recording_id, err)
                res.json(err);
              } else {
                // Update the meeting's has_async attendance boolean if this was the last recording
                if(async_attendance.recordings.length === 0) {
                  Meeting.findByIdAndUpdate(meeting_id,
                    {has_async_attendance: false},
                    (error, meeting) => {
                      if(error || meeting == null) {
                        console.log("<ERROR (meetings/remove_recording)> updating meeting with id",
                          meeting_id, error)
                        res.json(error)
                      } else {
                        console.log("<SUCCESS> (meetings/remove_recording) Deleting recording with ID:",
                          recording_id, "and updating async_attendance and meeting")
                        res.json('Successfully removed recording from meeting');
                      }
                    })
                } else {
                  console.log("<SUCCESS> (meetings/remove_recording) Deleting recording with ID:",
                    recording_id, "and updating async_attendance")
                  res.json('Successfully removed recording from meeting');
                }
              }
            });
          } catch (error) {
            console.log("<ERROR> (meetings/remove_recording) awaiting recording submission promise deletion:",error)
            res.json(error)
          }
        }
      })
    }
  )
})

// TODO: Update routes to use deleteMany
meetingRoutes.route('/delete/:meeting_id').delete(async function (req, res) {
  let meeting_id = req.params.meeting_id
  let meeting = req.body.meeting

  let meeting_live_attendance = meeting.live_attendance
  let qr_submission_promises = []
  let qr_promises = []
  let notification_job_promises = []
  // Delete live attendance
  if(meeting.has_live_attendance) {
    meeting_live_attendance.qr_checkins.forEach(qr_checkin => {
      // Delete qr checkin submissions
      qr_checkin.qr_checkin_submissions.forEach(submission => {
        let submission_id = submission._id
        qr_submission_promises.push(new Promise((resolve,reject) => {
          LiveSubmission.findByIdAndRemove(submission_id, (error) => {
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
      let qr_checkin_id = qr_checkin._id
      qr_promises.push(new Promise((resolve,reject) => {
        QRCheckin.findByIdAndRemove(qr_checkin_id, (error) => {
          if (error) {
            console.log("<ERROR (meetings/delete)> deleting QR checkin with ID:", qr_checkin_id,
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
    LiveAttendance.findByIdAndRemove(meeting_live_attendance._id, (err) => {
      if (err) {
        console.log("<ERROR> (meetings/delete)> deleting live attendance with ID:", meeting_live_attendance._id)
        res.json(err);
      }
    });
  } catch (error) {
    console.log("<ERROR> (meetings/delete) deleting live attendance:",error)
    res.status(500).json(error)
  }

  let meeting_async_attendance = meeting.async_attendance
  let recording_submission_promises = []
  let recording_promises = []
  // Delete async attendance
  if(meeting.has_async_attendance) {
    meeting_async_attendance.recordings.forEach(recording => {
      // Delete recording submissions
      recording.recording_submissions.forEach(submission => {
        let submission_id = submission._id
        recording_submission_promises.push(new Promise((resolve,reject) => {
          AsyncSubmission.findByIdAndRemove(submission_id, (error) => {
            if (error) {
              console.log("<ERROR (meetings/delete)> deleting recording submission with ID:",
                submission_id, error)
              reject(false)
              res.json(error);
            } else {
              resolve(true)
            }
          })
        }))
      })
      // Delete recording
      let recording_id = recording._id
      recording_promises.push(new Promise((resolve,reject) => {
        Recording.findByIdAndRemove(recording_id, (err) => {
          if (err) {
            console.log("<ERROR (meetings/delete)> Deleting QR checkin with ID:", recording_id)
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
    await Promise.all(recording_submission_promises)
    await Promise.all(recording_promises)
    AsyncAttendance.findByIdAndRemove(meeting_async_attendance._id, (err) => {
      if (err) {
        console.log("<ERROR (meetings/delete)> deleting aysnc attendance with ID:", meeting_async_attendance._id)
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

    // Fill in for orgs later

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

meetingRoutes.post('/add_async_attendance', async (req, res) => {
  Meeting.find(async (error, meetings) => {
    if(error || meetings == null) {
      console.log("<ERROR> (meetings/add_async_attendance) Getting all meetings", errror)
      res.json(error)
    } else {
      let meeting_promises = []
      meetings.forEach(meeting => {
        if(meeting.async_attendance == null) {
          meeting_promises.push(new Promise(async (resolve,reject) => {
            let new_async_attendance = new AsyncAttendance()
            try {
              let saved_async_attendance = await new_async_attendance.save()
              meeting.async_attendance = saved_async_attendance
              let saved_meeting = await meeting.save()
              resolve(saved_meeting)
            } catch (error) {
              console.log("<ERROR> (meetings/add_async_attendance) saving async_attendance and meeting:",
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
        console.log("<SUCCESS> (meetings/add_async_attendance) updating all meetings")
        res.json(saved_meetings)
      } catch(error) {
        console.log("<ERROR> (meetings/add_async_attendance) updating all meetings:",error)
        res.json(error)
      }
    }
  })
})

meetingRoutes.route('/upcoming').get(function (req, res) {
  Meeting.find().
  populate({
    path: 'course'
  }).
  populate({
    path: 'live_attendance',
    populate: {
      path: 'qr_checkins'
    }
  }).
  exec((error,meetings) => {
    if(error || meetings == null){
      console.log("<ERROR> (meetings/upcoming) Getting meetings",error)
      res.json(error);
    } else {
      let upcoming_meetings = []
      meetings.forEach(meeting => {
        if(meeting.has_live_attendance && new Date(meeting.start_time) > new Date()) {
          upcoming_meetings.push(meeting)
        }
      })
      console.log("<SUCCESS> (meetings/upcoming) Getting upcoming meetings")
      res.json(upcoming_meetings);
    }
  })
});

async function addMeeting(res, meeting){
  let new_meeting = new Meeting(meeting)
  let live_attendance = new LiveAttendance()
  let async_attendance = new AsyncAttendance()
  meeting.for_course ?  console.log("Was for course", meeting.course._id) : console.log("Was for org", meeting.org._id);
  if(new_meeting.has_live_attendance) {
    // Create the QR Checkins
    let qr_promises = []
    meeting.qr_checkins.forEach(qr_checkin => {
      qr_promises.push(new Promise(async (resolve,reject) => {
        let new_qr_checkin = new QRCheckin(qr_checkin)
        try {
          let saved_qr_checkin = await new_qr_checkin.save()
          resolve(saved_qr_checkin)
        } catch (error) {
          console.log("<ERROR> (meetings/add) saving qr_checkin:",new_qr_checkin,error)
          res.json(error)
        }
      }))
    })
    // Attach live attendance to the meeting
    try{
      let saved_qr_checkins = await Promise.all(qr_promises)
      live_attendance.qr_checkins = saved_qr_checkins
      // let live_attendance = new LiveAttendance({
      //   qr_checkins: saved_qr_checkins
      // })
      // let saved_live_attendance = await live_attendance.save()
      // new_meeting.live_attendance = saved_live_attendance
    } catch(error) {
      console.log("<ERROR> (meetings/add) saving live attendance:",error)
      res.json(error)
    }
  }

  if(new_meeting.has_async_attendance) {
    //Create the recordings
    let recording_promises = []
    meeting.recordings.forEach(recording => {
      recording_promises.push(new Promise(async (resolve,reject) => {
        let new_recording = new Recording(recording)
        try {
          let saved_recording = await new_recording.save()
          console.log("Saved recording", saved_recording)
          resolve(saved_recording)
        } catch (error) {
          console.log("<ERROR> (meetings/add) saving recording:",new_recording,error)
          res.json(error)
        }
      }))
    })
    // Attach async attendance to the meeting
    try{
      let saved_recordings = await Promise.all(recording_promises)
      async_attendance.recordings = saved_recordings
      // let async_attendance = new AsyncAttendance({
      //   recordings: saved_recordings
      // })
      // let saved_async_attendance = await async_attendance.save()
      // new_meeting.async_attendance = saved_async_attendance
    } catch(error) {
      console.log("<ERROR> (meetings/add) saving async attendance:",error)
      res.json(error)
    }
  }

  try {
    new_meeting.live_attendance = await live_attendance.save()
    new_meeting.async_attendance = await async_attendance.save()
    let saved_meeting = await new_meeting.save()
    if(new_meeting.for_course) {

      let updated_sections = await addMeetingToObjects(
        saved_meeting.sections, "section", saved_meeting._id)
      if(updated_sections == null)
        throw "Error in addMeetingToObjects updating sections"

      let student_ids = getAllStudentsFromSections(updated_sections)
      let updated_students = await addMeetingToObjects(
        student_ids, "user", saved_meeting._id)
      if(updated_students == null)
        throw "Error in addMeetingToObjects updating students"

      let instructor_id = await getInstructorFromCourse(
        updated_sections[0].course)
      let updated_instructor = await addMeetingToObjects(
        [instructor_id], "user", saved_meeting._id)
      if(updated_instructor == null)
        throw "Error in addMeetingToObjects updating instructor"
        new_meeting = saved_meeting;
    } else {

      //Update the Org and it's board & general members

    }
  } catch(error) {
    console.log("<ERROR> (meetings/add) saving meeting:",error)
    res.json(error)
  }
  return new_meeting;
}

// Duplicate from MeetingInfo.vue
// TODO(FreckledNin): Make into a global utility function
 function generateRandomCode() {
  const alnums = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 100; i > 0; --i) {
    result += alnums[Math.floor(Math.random() * alnums.length)];
  }
  return result;
}

async function addMeetingToObjects(object_ids, object_type, meeting_id) {
  try {
    let update_promises = []
    object_ids.forEach(object_id => {
      update_promises.push(new Promise(async (resolve,reject) => {
        if(object_type === "section") {
          Section.findByIdAndUpdate(object_id,
            {$push: {meetings: meeting_id}},
            {new: true},
            (error, section) => {
              if(error) {
                console.log("<ERROR> (meetings/add) updating section",error)
                reject(section)
              } else {
                resolve(section)
              }
            }
          )
        } else if(object_type === "user") {
          User.findByIdAndUpdate(object_id,
            {$push: {meetings: meeting_id}},
            {new: true},
            (error, user) => {
              if(error) {
                console.log("<ERROR> (meetings/add) updating user",error)
                reject(user)
              } else {
                resolve(user)
              }
            }
          )
        }
      }))
    })
    let updated_objects = await Promise.all(update_promises)
    return updated_objects
  } catch(error) {
    console.log("<ERROR> (meetings/add) in addMeetingToObjects for object_ids",
     object_ids,"with object type",object_type,"and meeting_id",meeting_id,error)
    return null
  }
}

function getAllStudentsFromSections(sections) {
  let all_students = []
  sections.forEach(section => {
    all_students = all_students.concat(section.students)
  })
  return all_students
}

async function getInstructorFromCourse(course_id) {
  try {
    let course_promise = new Promise((resolve, reject) => {
      Course.findById(course_id, (error, course) => {
        if(error) {
          console.log("<ERROR> (meetings/add) finding course by id",
            course_id, error)
            reject(course)
        } else {
          console.log("Returning")
          resolve(course.instructor)
        }
      })
    })
    let instructor_id = await Promise.resolve(course_promise)
    return instructor_id
  } catch(error) {
    console.log("<ERROR> (meetings/add) in getInstructorFromCourse for course_id",
      course_id, error)
    return null
  }
}

module.exports = meetingRoutes;
