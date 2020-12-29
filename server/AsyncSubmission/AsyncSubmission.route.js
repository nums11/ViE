const express = require('express');
const asyncSubmissionRoutes = express.Router();

let AsyncSubmission = require('./AsyncSubmission.model');
let Recording = require('../Recording/Recording.model');

asyncSubmissionRoutes.route('/add').post(async function (req, res) {
  let async_submission = new AsyncSubmission(req.body.async_submission);
  try {
    let saved_async_submission = await async_submission.save()
    Recording.findByIdAndUpdate(saved_async_submission.recording,
      {$push: {recording_submissions: saved_async_submission._id}},
      (error, recording) => {
        if(error || recording == null) {
          console.log("<ERROR> (async_submissions/add) Updating recording with id:",
            saved_async_submission.recording,error)
          res.json(error);
        } else {
          console.log("<SUCCESS> (async_submissions/add) Adding async submission for recording")
          res.json(saved_async_submission);
        }
      })
  } catch(error) {
    console.log("<ERROR> (async_submissions/add) Adding Async Submission:",
      async_submission,error)
    res.json(error);
  }
});

asyncSubmissionRoutes.route('/update/:async_submission_id').post(function (req, res) {
  let async_submission_id = req.params.async_submission_id
  let async_submission = req.body.async_submission
  AsyncSubmission.findByIdAndUpdate(async_submission_id,
    {
      furthest_video_time: async_submission.furthest_video_time,
      video_percent_watched: async_submission.video_percent_watched,
    },
    (error, updated_submission) => {
      if (error || updated_submission == null) {
        console.log("<ERROR> Updating async_submission with ID:",async_submission_id,
          async_submission, error)
        res.json(err);
      } else {
        console.log("<SUCCESS> Updating async_submission with ID:",async_submission_id,)
        res.json(updated_submission);
      }
    }
  );
});


module.exports = asyncSubmissionRoutes;
