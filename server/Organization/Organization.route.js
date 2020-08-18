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

orgRoutes.route('/add_board_member/:org_id/:user_id/:is_general_member').post(function (req, res) {
  let org_id = req.params.org_id;
  let user_id = req.params.user_id;
  let is_general_member = false
  if(req.params.is_general_member === "true")
    is_general_member = true

  if(is_general_member) {
    Org.findByIdAndUpdate(org_id,
      {
        $pull: {general_members: user_id},
        $push: {board_members: user_id}
      },
      function (err, org) {
        if (err || org == null) {
          console.log("<ERROR> (orgs/add_board_member) Updating org with id",
            org_id,err)
          res.status(400).json(err);
        } else {
          console.log("<SUCCESS> (orgs/add_board_member) Adding board member",user_id,
            "to org",org_id)
          res.status(200).json(org);
        }
      }
    );
  } else {
    Org.findByIdAndUpdate(org_id,
      {
        $push: {board_members: user_id}
      },
      function (err, org) {
        if (err || org == null) {
          console.log("<ERROR> (orgs/add_board_member) Updating org with id",
            org_id,err)
          res.status(400).json(err);
        } else {
          User.findByIdAndUpdate(user_id,
            {$push: {user_orgs: org_id}},
            (error, user) => {
              if(error || user == null) {
                console.log("<ERROR> (orgs/add_board_member) Updating user with id",user_id,err)
                res.json(err);
              } else {
                console.log("<SUCCESS> (orgs/add_board_member) Adding board member",user_id,
                  "to org",org_id)
                res.status(200).json(org);
              }
            }
          )
        }
      }
    );
  }
});

orgRoutes.route('/add_general_member/:org_id/:user_id/:is_board_member').post(function (req, res) {
  let org_id = req.params.org_id;
  let user_id = req.params.user_id;
  let is_board_member = false
  if(req.params.is_board_member === "true")
    is_board_member = true

  if(is_board_member) {
    Org.findByIdAndUpdate(org_id,
      {
        $pull: {board_members: user_id},
        $push: {general_members: user_id}
      },
      function (err, org) {
        if (err || org == null) {
          console.log("<ERROR> (orgs/add_general_member) Updating org with id",
            org_id,err)
          res.status(400).json(err);
        } else {
          console.log("<SUCCESS> (orgs/add_general_member) Adding board member",user_id,
            "to org",org_id)
          res.status(200).json(org);
        }
      }
    );
  } else {
    Org.findByIdAndUpdate(org_id,
      {
        $push: {general_members: user_id}
      },
      function (err, org) {
        if (err || org == null) {
          console.log("<ERROR> (orgs/add_general_member) Updating org with id",
            org_id,err)
          res.status(400).json(err);
        } else {
          User.findByIdAndUpdate(user_id,
            {$push: {user_orgs: org_id}},
            (error, user) => {
              if(error || user == null) {
                console.log("<ERROR> (orgs/add_general_member) Updating user with id",user_id,err)
                res.json(err);
              } else {
                console.log("<SUCCESS> (orgs/add_general_member) Adding board member",user_id,
                  "to org",org_id)
                res.status(200).json(org);
              }
            }
          )
        }
      }
    );
  }
});

orgRoutes.route('/remove_member/:org_id/:user_id/:is_board_member').post(function (req, res) {
  let org_id = req.params.org_id;
  let user_id = req.params.user_id;
  let is_board_member = false
  if(req.params.is_board_member === "true")
    is_board_member = true

  if(is_board_member) {
    Org.findByIdAndUpdate(org_id,
      {
        $pull: {board_members: user_id}
      },
      function (err, org) {
        if (err || org == null) {
          console.log("<ERROR> (orgs/remove_member) Updating org with id",
            org_id,err)
          res.status(400).json(err);
        } else {
          User.findByIdAndUpdate(user_id,
            {$pull: {user_orgs: org_id}},
            (error, user) => {
              if(error || user == null) {
                console.log("<ERROR> (orgs/remove_member) Updating user with id",user_id,err)
                res.json(err);
              } else {
                console.log("<SUCCESS> (orgs/remove_member) Removing member",user_id,
                  "from org",org_id)
                res.status(200).json(org);
              }
            }
          )
        }
      }
    );
  } else {
    Org.findByIdAndUpdate(org_id,
      {
        $pull: {general_members: user_id}
      },
      function (err, org) {
        if (err || org == null) {
          console.log("<ERROR> (orgs/remove_member) Updating org with id",
            org_id,err)
          res.status(400).json(err);
        } else {
          User.findByIdAndUpdate(user_id,
            {$pull: {user_orgs: org_id}},
            (error, user) => {
              if(error || user == null) {
                console.log("<ERROR> (orgs/remove_member) Updating user with id",user_id,err)
                res.json(err);
              } else {
                console.log("<SUCCESS> (orgs/remove_member) Removing member",user_id,
                  "from org",org_id)
                res.status(200).json(org);
              }
            }
          )
        }
      }
    );
  }
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
  Org.findById(id).
  populate('board_members').
  populate('general_members').
  populate('meetings').
  exec((error, org) => {
    if(error || org == null) {
      console.log("<ERROR> (orgs/get) Getting org with ID:",id)
      res.json(err);
    } else {
      console.log("<SUCCESS> (orgs/get) Getting org with ID:",id)
      res.json(org)
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
