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
  populate('recording_submissions').
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

module.exports = recordingRoutes;
