const express = require('express');
const meetingRoutes = express.Router();

let Meeting = require('./Meeting.model');
let RealTimePortion = require('../RealTimePortion/RealTimePortion.model');
let AsyncPortion = require('../AsyncPortion/AsyncPortion.model');
let Submission = require('../Submission/Submission.model');
let QRScan = require('../QRScan/QRScan.model');
let Video = require('../Video/Video.model');
let Course = require('../Course/Course.model');
// let Poll = require('../Poll/Poll.model');
let User = require('../User/User.model');
let Section = require('../Section/Section.model');
const NotificationJob = require('../Notification/NotificationJob.model');
const {Storage} = require("@google-cloud/storage")
const path = require('path');
// var multer = require("multer")
// var upload = multer({ storage: multer.memoryStorage() })
var multiparty = require('multiparty')

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

meetingRoutes.post('/add', async (req, res, next) => {
  const title = req.body.title
  const real_time_portion = req.body.real_time_portion
  const num_qr_scans = req.body.num_qr_scans
  const async_portion = req.body.async_portion
  const sections = req.body.sections

  try {
    // Create the meeting and the necessary objects
    let saved_real_time_portion = null, saved_async_portion = null
    if(real_time_portion != null) {
      // Is this running twice
      const saved_qr_scans = await createQRScans(num_qr_scans)
      if(saved_qr_scans == null)
        throw "<ERROR> meetings/add saving qr scans"
      new_real_time_portion = new RealTimePortion({
        real_time_start: real_time_portion.real_time_start,
        real_time_end: real_time_portion.real_time_end,
        qr_scans: saved_qr_scans
      })
      saved_real_time_portion = await new_real_time_portion.save()
    }
    const new_meeting = new Meeting({
      title: title,
      sections: sections,
      real_time_portion: new_real_time_portion,
      async_portion: null
    })
    const saved_meeting = await new_meeting.save()

    // Update the section, instructor, and students
    const updated_sections = await addMeetingToObjects(
      saved_meeting.sections, "section", saved_meeting._id)
    if(updated_sections == null)
      throw "<ERROR> meetings/add"
    const student_ids = getAllStudentsFromSections(updated_sections)
    const updated_students = await addMeetingToObjects(
      student_ids, "user", saved_meeting._id)
    if(updated_students == null)
      throw "<ERROR> meetings/add"
    const instructor_id = await getInstructorFromCourse(
      updated_sections[0].course)
    const updated_instructor = await addMeetingToObjects(
      [instructor_id], "user", saved_meeting._id)
    if(updated_instructor == null)
      throw "<ERROR> meetings/add"

    res.json(saved_meeting)
  } catch(error) {
    next(error)
  }
});

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

// TODO: Remove reliance on the has_real_time_portion and has_async_portion
// booleans
meetingRoutes.route('/add_video/:meeting_id').post(async (req, res) => {
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

// TODO: remove video video from GCS
// Need to update has async attendance
// For removing video from GCS would have to first ensure that all videos saved have unique names
// (e.g. adding the timestamp)
meetingRoutes.route('/remove_video/:meeting_id/:async_portion_id/:video_id').
delete(async function (req, res) {
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
meetingRoutes.route('/delete/:meeting_id').delete(async function (req, res) {
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

meetingRoutes.route('/upcoming').get(function (req, res) {
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
    console.log("<ERROR> in addMeetingToObjects for object_ids",
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

async function createQRScans(num_qr_scans) {
  try {
    let qr_scan_promises = []
    for(let i = 0; i < num_qr_scans; i++) {
      qr_scan_promises.push(new Promise(async (resolve, reject) => {
        const random_code = generateRandomCode() 
        const qr_scan = new QRScan({
          code: random_code
        })
        const saved_qr_scan = await qr_scan.save()
        resolve(saved_qr_scan)
      }))
    }
    const saved_qr_scans = await Promise.all(qr_scan_promises)
    return saved_qr_scans
  } catch(error) {
    console.log(`<ERROR> createQRScans num_qr_scans: ${num_qr_scans}`, error)
    return null
  }
}

function generateRandomCode() {
  const alnums = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 100; i > 0; --i) {
    result += alnums[Math.floor(Math.random() * alnums.length)];
  }
  return result;
}

module.exports = meetingRoutes;
