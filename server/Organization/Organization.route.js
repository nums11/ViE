const express = require('express');
const orgRoutes = express.Router();

let Org = require('./Organization.model');
let User = require('../User/User.model');

orgRoutes.route('/add').post(function (req, res) {
  let org = new Org(req.body.org);
  org.save()
    .then(() => {
      console.log("<SUCCESS> (orgs/add) Adding org:",org)
      res.status(200).json(org);
    })
    .catch((error) => {
      console.log("<ERROR> (orgs/add) Adding org:",org, error)
      res.status(400).send("unable to save org to database");
    });
});

orgRoutes.route('/').get(function (req, res) {
  Org.find(function (err, orgs) {
    if (err || orgs == null) {
      console.log("<ERROR> Getting all orgs")
      res.json(err);
    } else {
      console.log("<Success> Getting all orgs")
      res.json(orgs);
    }
  });
});

orgRoutes.route('/get/:id').get(function (req, res) {
  let id = req.params.id;
  Org.findById(id, function (err, org) {
    if (err || org == null) {
      console.log("<ERROR> Getting org with ID:",id)
      res.status(404).json(err);
    } else {
		  User.find({'_id': {$in: org.board_members}}, (error, board_members) => {
				if(error || board_members == null) {
					console.log("<ERROR> Getting board_members for org with ID:",id)
					res.status(404).json(err);
				} else {
          org.board_members = board_members;
          User.find({'_id': {$in: org.general_members}}, (error, general_members) => {
            if(error || general_members == null) {
              console.log("<ERROR> Getting general_members for org with ID:",id)
              res.status(404).json(err);
            } else {
              org.general_members = general_members
              console.log("<SUCCESS> Getting org with ID:",id);
              res.json(org)
            }
          })
				}
			});
    }
  });
});

orgRoutes.route('/update/:id').post(function (req, res) {
  let id = req.params.id;
  let updated_org = req.body.updated_org;
  Org.findByIdAndUpdate(id,
    {
      name: updated_org.name,
    },
    function (err, org) {
      if (err || org == null) {
        console.log("<ERROR> (orgs/update) Updating org by ID:",id,err)
        res.status(400).json(err)
      } else {
        console.log("<SUCCESS> (orgs/update) Updating org by ID:",id)
        res.json(org);
      }
    }
  );
});

orgRoutes.route('/delete/:id').delete(function (req, res) {
  Org.findByIdAndRemove({ _id: req.params.id }, function (err) {
    if (err) {
      console.log("<ERROR> Deleting org with ID:",req.params.id)
      res.json(err);
    } else {
      console.log("<SUCCESS> Deleting org with ID:",req.params.id)
      res.json('Successfully removed');
    }
  });
});




module.exports = orgRoutes;
