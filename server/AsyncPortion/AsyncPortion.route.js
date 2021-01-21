const express = require('express');
const asyncPortionRoutes = express.Router();
const AsyncPortion = require('./AsyncPortion.model');
const Video = require('../Video/Video.model');

// GET --------------

asyncPortionRoutes.get('/', function (req, res) {
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

asyncPortionRoutes.get('/get/:id', function (req, res, next) {
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

// POST ------------------------

asyncPortionRoutes.post('/add_video/:async_portion_id',
  async function(req, res, next) {
  const async_portion_id = req.params.async_portion_id
  const video = req.body.video

  try {
    const new_video = new Video(video)
    const saved_video = await new_video.save()
    AsyncPortion.findByIdAndUpdate(async_portion_id,
      {$push: {videos: saved_video}},
      {new: true},
      (error, updated_async_portion) => {
        if(error) {
          console.log(`<ERROR> (async_portions/add_video)`,
            ` updating async_portion with id ${async_portion_id}`,
            ` with video`, video)
          next(error)
        } else if(updated_async_portion == null) {
          console.log(`<ERROR> (async_portions/add_video) could not`,
            + ` find async_portion with id ${async_portion_id}`)
          res.status(404).json("async_portion not found")
        } else {
          console.log("<SUCCESS> (async_portions/add_video)")
          res.json(saved_video)
        }
      }
    )
  } catch(error) {
    console.log(`<ERROR> (async_portions/add_video)`
      + ` async_portion_id: ${async_portion_id}`
      + ` video`, video)
    next(error)
  }
})

asyncPortionRoutes.post('/update/:id', function (req, res) {
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
