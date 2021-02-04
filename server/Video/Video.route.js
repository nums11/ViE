const express = require('express');
const videoRoutes = express.Router();
const Video = require('../Video/Video.model');
const Submission = require('../Submission/Submission.model');
const VideoHelper = require('../helpers/video_helper')

// GET -------------------

videoRoutes.get('/', function (req, res) {
  Video.find(function (err, videos) {
    if (err || videos == null) {
      console.log("<ERROR> Getting all videos")
      res.json(err);
    } else {
      console.log("<Success> Getting all videos")
      res.json(videos);
    }
  });
});

videoRoutes.get('/get/:id', function (req, res, next) {
  let id = req.params.id;
  Video.findById(id).
  populate({
    path: 'video_submissions',
    populate: {
      path: 'submitter'
    }
  }).
  exec((error,video) => {
    if(error){
      next(error);
    } else if(video == null) {
      console.log(`<ERROR> (videos/get) Getting video with ID ${id}` +
        ` video not found.`)
      res.status(404).json(error)
    } else {
      console.log(`<SUCCESS> (videos/get) Getting video by ID: ${id}`)
      res.json(video);
    }
  })
});

// POST --------------------

videoRoutes.post('/update/:id', function (req, res) {
  let id = req.params.id;
  let updated_video = req.body.updated_video;
  Video.findByIdAndUpdate(id,
    {
      video_submission_start_time: updated_video.video_submission_start_time,
      video_submission_end_time: updated_video.video_submission_end_time,
    },
    function (err, video) {
      if (err || video == null) {
        console.log("<ERROR> (videos/update) Updating video by ID:",id,"with:",updated_video)
        res.status(404).send("video not found");
      } else {
        console.log("<SUCCESS> (videos/update) Updating video by ID:",id,"with:")
        res.json(video);
      }
    }
  );
});

videoRoutes.post('/add_submission/:video_id',
  async function (req, res, next) {
  const video_id = req.params.video_id;
  const submission = req.body.submission;

  try {
    const new_submission = new Submission(submission)
    const saved_submission = await new_submission.save()
    const video_promise = new Promise((resolve, reject) => {
      Video.findByIdAndUpdate(video_id,
        {$push: {submissions: saved_submission}},
        (error, video) => {
          if(error) {
            console.log(`<ERROR> (videos/add_submission) updating`
              + ` video with id ${video_id} with submission`,
              saved_submission, error)
            reject(error)
          } else if(video == null) {
            console.log(`<ERROR> (videos/add_submission) video`
              + ` with id ${video_id} not found`)
            reject(null)
          } else {
            resolve(video)
          }
        }
      )
    })
    await Promise.resolve(video_promise)
    res.json(saved_submission)
  } catch(error) {
    console.log(`<ERROR> (videos/add_submission) video_id ${video_id}`,
      ` submission`, submission)
    next(error)
  }
});

// DELETE ------------------------
// TODO: Remove the video from cloud storage?

videoRoutes.delete('/delete/:video_id',
  async function (req, res, next) {
  const video_id = req.params.video_id
  const async_portion_id = req.body.async_portion_id
  const submission_ids = req.body.submission_ids
  const quiz_id = req.body.quiz_id
  const quiz_question_ids = req.body.quiz_question_ids
  
  try {
    const deletion_status = await VideoHelper.deleteVideo(
      video_id, async_portion_id, submission_ids, quiz_id,
      quiz_question_ids)
    if(!deletion_status)
      throw "<ERROR> (videos/delete) deleting video"
    console.log("<SUCCESS> (videos/delete)")
    res.json(true)
  } catch(error) {
    console.log(`<ERROR> (videos/delete) video_id ${video_id}`
      + ` async_portion_id ${async_portion_id}`)
    next(error)
  }
});

module.exports = videoRoutes;
