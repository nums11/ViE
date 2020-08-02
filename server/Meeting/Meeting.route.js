const express = require('express');
const meetingRoutes = express.Router();

let Meeting = require('./Meeting.model');
let QRCheckin = require('../QRCheckin/QRCheckin.model');
let Poll = require('../Poll/Poll.model');
let User = require('../User/User.model');

meetingRoutes.route('/add').post(function (req, res) {
  let meeting = new Meeting(req.body.meeting);
  if(meeting.has_live_attendance){
    let new_qr_checkins = []
    meeting.qr_checkins.forEach(async qr_checkin => {
      try{
        let new_qr_checkin = new QRCheckin(qr_checkin)
        await new_qr_checkin.save()
        new_qr_checkins.push(new_qr_checkin)
        console.log("<SUCCESS> Adding checkin:",meeting)
      } catch(error) {
        console.log("<ERROR> saving checkin for meeting")
        res.json(error)
      }
    });
    meeting.qr_checkins = new_qr_checkins
    meeting.save()
      .then(() => {
        console.log("<SUCCESS> Adding meeting:",meeting)
        res.status(200).json(meeting);
      })
      .catch(() => {
        console.log("<ERROR> Adding meeting:",meeting)
        res.status(400).send("unable to save meeting to database");
      });
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
