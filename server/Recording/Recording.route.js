const express = require('express');
const recordingRoutes = express.Router();

let Recording = require('../Recording/Recording.model');

recordingRoutes.route('/').get(function (req, res) {
  Recording.find(function (err, recordings) {
    if (err || recordings == null) {
      console.log("<ERROR> Getting all recordings")
      res.json(err);
    } else {
      console.log("<Success> Getting all recordings")
      res.json(recordings);
    }
  });
});

recordingRoutes.route('/get/:id').get(function (req, res) {
  let id = req.params.id;
  Recording.findById(id).
  populate({
    path: 'recording_submissions',
    populate: {
      path: 'submitter'
    }
  }).
  exec((error,recording) => {
    if(error || recording == null){
      console.log("<ERROR> (recordings/get) Getting recording with ID:",id,error)
      res.json(error);
    } else {
      console.log("<SUCCESS> (recordings/get) Getting recording by ID:",id)
      res.json(recording);
    }
  })
});

recordingRoutes.route('/update/:id').post(function (req, res) {
  let id = req.params.id;
  let updated_recording = req.body.updated_recording;
  Recording.findByIdAndUpdate(id,
    {
      recording_submission_start_time: updated_recording.recording_submission_start_time,
      recording_submission_end_time: updated_recording.recording_submission_end_time,
    },
    function (err, recording) {
      if (err || recording == null) {
        console.log("<ERROR> (recordings/update) Updating recording by ID:",id,"with:",updated_recording)
        res.status(404).send("recording not found");
      } else {
        console.log("<SUCCESS> (recordings/update) Updating recording by ID:",id,"with:")
        res.json(recording);
      }
    }
  );
});

module.exports = recordingRoutes;
