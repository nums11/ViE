const express = require('express');
const asyncPortionRoutes = express.Router();

const AsyncPortion = require('../AsyncPortion/AsyncPortion.model');

asyncPortionRoutes.route('/').get(function (req, res) {
  AsyncPortion.find(function (err, async_portions) {
    if (err || async_portions == null) {
      console.log("<ERROR> Getting all async_portions")
      res.json(err);
    } else {
      console.log("<Success> Getting all async_portions")
      res.json(async_portions);
    }
  });
});

asyncPortionRoutes.route('/get/:id').get(function (req, res, next) {
  const id = req.params.id;
  AsyncPortion.findById(id).
  populate({
    path: 'videos',
    populate: {
      path: 'submissions',
      populate: {
        path: 'submitter'
      }
    }
  }).
  exec((error,async_portion) => {
    if(error){
      next(error);
    } else if(async_portion == null) {
      console.log(`<ERROR> (async_portions/get) Getting async_portion with ID ${id}` +
        ` async_portion not found.`)
      res.status(404).json("AsyncPortion not found")
    } else {
      console.log(`<SUCCESS> (async_portions/get) Getting async_portion by ID: ${id}`)
      res.json(async_portion);
    }
  })
});

asyncPortionRoutes.route('/update/:id').post(function (req, res) {
  let id = req.params.id;
  let updated_video = req.body.updated_video;
  AsyncPortion.findByIdAndUpdate(id,
    {
      video_submission_start_time: updated_video.video_submission_start_time,
      video_submission_end_time: updated_video.video_submission_end_time,
    },
    function (err, async_portion) {
      if (err || async_portion == null) {
        console.log("<ERROR> (async_portions/update) Updating async_portion by ID:",id,"with:",updated_video)
        res.status(404).send("async_portion not found");
      } else {
        console.log("<SUCCESS> (async_portions/update) Updating async_portion by ID:",id,"with:")
        res.json(async_portion);
      }
    }
  );
});

module.exports = asyncPortionRoutes;
