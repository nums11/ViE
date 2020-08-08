const express = require('express');
const meetingRoutes = express.Router();

let Meeting = require('./Meeting.model');
let LiveAttendance = require('../LiveAttendance/LiveAttendance.model');
let QRCheckin = require('../QRCheckin/QRCheckin.model');
let Course = require('../Course/Course.model');
let Org = require('../Organization/Organization.model');
let Poll = require('../Poll/Poll.model');
let User = require('../User/User.model');

meetingRoutes.route('/add/:for_course/:course_or_org_id').post(async (req, res) => {
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

  try {
    // Create the meeting
    let saved_qr_checkins = await Promise.all(qr_promises)
    let live_attendance = new LiveAttendance({
      qr_checkins: saved_qr_checkins
    })
    let saved_live_attendance = await live_attendance.save()
    let new_meeting = new Meeting(meeting)
    new_meeting.live_attendance = saved_live_attendance
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
  Meeting.findById(id, function (err, meeting) {
    if (err || meeting == null) {
      console.log("<ERROR> Getting meeting with ID:",id)
      res.status(404).json(err);
    } else {
		  User.find({'_id': {$in: meeting.board_members}}, (error, board_members) => {
				if(error || board_members == null) {
					console.log("<ERROR> Getting board_members for meeting with ID:",id)
					res.status(404).json(err);
				} else {
          meeting.board_members = board_members;
          User.find({'_id': {$in: meeting.general_members}}, (error, general_members) => {
            if(error || general_members == null) {
              console.log("<ERROR> Getting general_members for meeting with ID:",id)
              res.status(404).json(err);
            } else {
              meeting.general_members = general_members
              console.log("<SUCCESS> Getting meeting with ID:",id);
              res.json(meeting)
            }
          })
				}
			});
    }
  });
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
