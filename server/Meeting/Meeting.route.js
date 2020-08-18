const express = require('express');
const meetingRoutes = express.Router();

let Meeting = require('./Meeting.model');
let LiveAttendance = require('../LiveAttendance/LiveAttendance.model');
let AsyncAttendance = require('../AsyncAttendance/AsyncAttendance.model');
let QRCheckin = require('../QRCheckin/QRCheckin.model');
let Recording = require('../Recording/Recording.model');
let Course = require('../Course/Course.model');
let Org = require('../Organization/Organization.model');
let Poll = require('../Poll/Poll.model');
let User = require('../User/User.model');
const {Storage} = require("@google-cloud/storage")
const path = require('path');
var multer = require("multer")
var upload = multer({ storage: multer.memoryStorage() })

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

meetingRoutes.post('/save_to_gcs',
  upload.array('recording_videos'), async (req, res) => {
    let videos = req.files
    let video_promises = []
    videos.forEach(video => {
      video_promises.push(new Promise(async (resolve,reject) => {
        try {
          let video_gcs_url = await uploadVideoToGCS(video)
          resolve(video_gcs_url)
        } catch (error) {
          console.log("<ERROR> (meetings/save_to_gcs) saving video to GCS:",video,error)
          res.json(error)
        }
      }))
    })
    try{
      let saved_video_urls = await Promise.all(video_promises)
      res.json(saved_video_urls)
    } catch(error) {
      console.log("<ERROR> (meetings/save_to_gcs) saving videos to GCS:",error)
      res.json(error)
    }
  }
)


meetingRoutes.post('/add/:for_course/:course_or_org_id', async (req, res) => {
  let meeting = req.body.meeting;
  let for_course = false
  let course_id = ""
  let org_id = ""
  if(req.params.for_course === "true"){
    for_course = true
    course_id = req.params.course_or_org_id
    console.log("Was for course", course_id)
  } else {
    org_id = req.params.course_or_org_id
    console.log("Was for org", org_id)
  }

  let new_meeting = new Meeting(meeting)

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
      let live_attendance = new LiveAttendance({
        qr_checkins: saved_qr_checkins
      })
      let saved_live_attendance = await live_attendance.save()
      new_meeting.live_attendance = saved_live_attendance
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
      let async_attendance = new AsyncAttendance({
        recordings: saved_recordings
      })
      let saved_async_attendance = await async_attendance.save()
      new_meeting.async_attendance = saved_async_attendance
    } catch(error) {
      console.log("<ERROR> (meetings/add) saving async attendance:",error)
      res.json(error)
    }
  }

  try {
    let saved_meeting = await new_meeting.save()
    if(for_course) {

      //Update the Course and it's students & instructors
      Course.findByIdAndUpdate(course_id,
        {$push: {meetings: saved_meeting._id}},
        (error,course) => {
          if(error || course == null) {
            console.log("<ERROR> (meetings/add) Updating course with id",
              course_id, err)
            res.json(error);
          } else {
            User.findByIdAndUpdate(course.instructor,
              {$push: {meetings: saved_meeting._id}},
              async (error, user) => {
                if(error || user == null) {
                  console.log("<ERROR> (meetings/add) Updating instructor with id",
                    course.instructor, error)
                  res.json(error);
                } else {
                  let student_promises = []
                  course.students.forEach(student => {
                    student_promises.push(new Promise(async (resolve, reject) => {
                      User.findByIdAndUpdate(student,
                        {$push: {meetings: saved_meeting._id}},
                        (error, user) => {
                          if(error || user == null) {
                            console.log("<ERROR> (meetings/add) Updating student with id",
                              student, error)
                            res.json(error);
                          } else {
                            resolve(user)
                          }
                        })
                    }))
                  })
                  try {
                    let updated_students = await Promise.all(student_promises)
                    console.log("<SUCCESS> (meetings/add) Creating meeting and updating"
                      + " course instructor and students")
                    res.json(saved_meeting)
                  } catch (error) {
                    console.log("<ERROR> (meetings/add) Updating students", error)
                    res.json(error)
                  }
                }
              })
          }
        })

    } else {

      //Update the Org and it's board & general members
      Org.findByIdAndUpdate(org_id,
        {$push: {meetings: saved_meeting._id}},
        async (error, org) => {
          if(error || org == null) {
            console.log("<ERROR> (meetings/add) Updating org with id org_id", error)
            res.json(error);
          } else {
            let member_promises = []
            org.board_members.forEach(board_member => {
              member_promises.push(new Promise(async (resolve, reject) => {
                User.findByIdAndUpdate(board_member,
                  {$push: {meetings: saved_meeting._id}},
                  (error, user) => {
                    if(error || user == null) {
                      console.log("<ERROR> (meetings/add) Updating board member with id",
                        board_member, error)
                      res.json(error);
                    } else {
                      resolve(user)
                    }
                  })
              }))
            })
            org.general_members.forEach(general_member => {
              member_promises.push(new Promise(async (resolve, reject) => {
                User.findByIdAndUpdate(general_member,
                  {$push: {meetings: saved_meeting._id}},
                  (error, user) => {
                    if(error || user == null) {
                      console.log("<ERROR> (meetings/add) Updating board member with id",
                        general_member, error)
                      res.json(error);
                    } else {
                      resolve(user)
                    }
                  })
              }))
            })
            try {
              let updated_members = await Promise.all(member_promises)
              console.log("<SUCCESS> (meetings/add) Creating meeting and updating"
                + " org board and general members")
              res.json(saved_meeting)
            } catch (error) {
              console.log("<ERROR> (meetings/add) Updating org members", error)
              res.json(error)
            }
          }
        })

    }
  } catch(error) {
    console.log("<ERROR> (meetings/add) saving meeting:",error)
    res.json(error)
  }

});

meetingRoutes.route('/').get(function (req, res) {
  Meeting.find(function (err, meetings) {
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
    path: 'course',
    populate: {
      path: 'instructor'
    }
  }).
  populate('org').
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
      name: updated_meeting.name,
      board_members: updated_meeting.board_members,
      general_members: updated_meeting.general_members,
    },
    function (err, meeting) {
      if (err || meeting == null) {
        console.log("<ERROR> Updating meeting by ID:",id,"with:",updated_meeting)
        res.status(404).send("meeting not found");
      } else {
        console.log("<SUCCESS> Updating meeting by ID:",id,"with:",updated_meeting)
        res.json(meeting);
      }
    }
  );
});

meetingRoutes.route('/delete/:id').delete(function (req, res) {
  Meeting.findByIdAndRemove({ _id: req.params.id }, function (err) {
    if (err) {
      console.log("<ERROR> Deleting meeting with ID:",req.params.id)
      res.json(err);
    } else {
      console.log("<SUCCESS> Deleting meeting with ID:",req.params.id)
      res.json('Successfully removed');
    }
  });
});

module.exports = meetingRoutes;
