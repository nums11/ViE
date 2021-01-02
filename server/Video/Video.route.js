const express = require('express');
const videoRoutes = express.Router();

let Video = require('../Video/Video.model');

videoRoutes.route('/').get(function (req, res) {
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

videoRoutes.route('/get/:id').get(function (req, res) {
  let id = req.params.id;
  Video.findById(id).
  populate({
    path: 'video_submissions',
    populate: {
      path: 'submitter'
    }
  }).
  exec((error,video) => {
    if(error || video == null){
      console.log("<ERROR> (videos/get) Getting video with ID:",id,error)
      res.json(error);
    } else {
      console.log("<SUCCESS> (videos/get) Getting video by ID:",id)
      res.json(video);
    }
  })
});

videoRoutes.route('/update/:id').post(function (req, res) {
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

module.exports = videoRoutes;
