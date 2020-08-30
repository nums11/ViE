const express = require('express');
const orgRoutes = express.Router();
var mongoose = require('mongoose');
const {FrontEndServerBaseURL} = require('../Auth/API_URL')

let Org = require('./Organization.model');
let User = require('../User/User.model');

const createUserId = (email) => {
  let split_ = email.split('@')
  let main_ = split_[0]
  return `${main_}#${  ((Math.random() * 9000) + 1000).toFixed(0) }`
}

const sendInviteEmail = (first_name, last_name, target_email, course_name, user_id, invite_key) => {

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: target_email,
    from: process.env.VENUE_EMAIL,
    template_id: "d-6de977e651844de7a67ba2a50ebedc6d",
    dynamic_template_data: {
      subject: `[Venue] ${course_name} Invite`,
      first_name,
      last_name,
      course_name,
      invite_link: `${FrontEndServerBaseURL()}#/org/accept_invite/${user_id}/${invite_key}`
    }
    // text: '',
    // html: `
    // <h3>Venue</h3>
    // <p>Hello ${first_name} ${last_name}</p>
    // <p>
    //   You have been invite to the course <string>${course_name}</string>
    // </p>
    // <a>Venue</a>
    // `,
  };
  sgMail.send(msg)
  .then(res => {
    console.log(`SUCCESS`)
    console.log(res)
  })
  .catch(err => {
    console.log(err)
    console.log(err.response.body.errors)
  })
}

const inviteStudentToCourse = async (org_doc, first_name, last_name, email) => {

  return new Promise((resolve, reject) => {

    if (first_name == null) {
      reject({
        error: 'No first name provided'
      })
    }
    if (last_name == null) {
      reject({
        error: 'No last name provided'
      })
    }
    if (email == null) {
      reject({
        error: 'No email provided'
      })
    }
    if (org_doc == null) {
      reject({
        error: 'No course document provided.'
      })
    }

    // Check if the user exists in the database
    User.findOne({ email: email }, async (err, user_doc) => {
      if (err) {
        reject ({
          error: `Error querying user with email ${email}`
        })
      }
      else if (user_doc) {
        // User exists
        
        // if the student is not already in the course ...
        if (org_doc.general_members.indexOf( user_doc._id ) == -1) {

          // add to the course and add the course to the student's user document
          org_doc.general_members.push(user_doc._id)
          // user_doc.user_orgs.push(org_doc._id)

          let invite_key_ = mongoose.Types.ObjectId()
          if (_.has(user_doc, 'pending_org_invites')) {
            user_doc.pending_org_invites.push({
              org_id: org_doc._id,
              invite_key: invite_key_
            })
          }
          else {
            user_doc.pending_org_invites = [{
              org_id: org_doc._id,
              invite_key: invite_key_
            }]
          }

          user_doc.save ()

          // TODO send email to student informing them that they have
          // been invited to this course.
          sendInviteEmail(first_name, last_name, email, org_doc.name, user_doc._id, invite_key_)

          resolve ({
            response: `Student with email [${email}] has been invited to org ${org_doc.name}`,
            user_status: `existing`,
            user: user_doc
          })

        }
        else {
          resolve({
            response: `Student is already in this course`
          })
        }

      }
      else {
        // User does not exist

        let invite_key = mongoose.Types.ObjectId()
        let confirm_key = randomstring.generate(64)
        let new_user = new User({
          first_name,
          last_name,
          user_id: createUserId(email),
          email,
          confirm_key: confirm_key,
          pending_org_invites: [{
            org_id: org_doc._id,
            invite_key: invite_key
          }]
        })

        // add the course to the student's list and the student to the course
        let saved_user = await new_user.save ()
        org_doc.general_members.push(saved_user._id)

        // TODO send email to student informing them that they have been added
        // to the course
        sendInviteEmail(first_name, last_name, email, org_doc.name, saved_user._id, invite_key)
        
        resolve ({
          response: `Student with email [${email}] has been invited to course ${org_doc.name}`,
          user_status: `new`,
          user: saved_user
        })
      }
    })

  })

}

orgRoutes.route('/invite/accept/:user_id/:invite_key').post((req, res) => {

  let invite_key = req.params.invite_key
  let user_id = req.params.user_id

  if (!invite_key) {
    console.log(`<ORG INVITE ACCEPT: ERROR> No invite key found`)
    res.json({
      success: false,
      error: 'No invite key found'
    })
    return;
  }

  if (!user_id) {
    console.log(`<ORG INVITE ACCEPT: ERROR> No user id found`)
    res.json({
      success: false,
      error: 'No user id found'
    })
    return;
  }

  User.findById(user_id, (err, user_doc) => {
    if (err || !user_doc) {
      console.error(`<ORG INVITE ACCEPT: ERROR> User doc not found for id ${user_id}`)
      res.json({
        success: false,
        error: 'No user found'
      })
    }
    else {

      let target_index = null
      let org_info = user_doc.pending_org_invites.filter((invite_data, i) => {
        if (invite_data.invite_key == invite_key) {
          target_index = i
          return true
        }
        else return false
      })
      if (org_info.length != 1) {
        res.json({
          success: false,
          error: 'Could not find the invite with the invite key'
        })
      }
      else {

        let org_id = org_info[0].org_id
        user_doc.pending_org_invites.splice(target_index, 1)
        user_doc.user_orgs.push(org_id)
        user_doc.save ()

        res.json({
          success: true,
          user: user_doc
        })

      }
    }
  })

})

orgRoutes.route('/invite/:org_id').post((req, res) => {

  if (!_.has(req.body, 'users')) {
    res.error('<INVITE/STUDENTS: Error> No users found in body.')
    res.json({
      success: false,
      error: 'No users found in body'
    })
    return;
  }

  let users = req.body.users

  let org_id = req.params.org_id
  Org.findById(org_id, (err, org_doc) => {
    if (err || !org_doc) {
      console.error(`<INVITE/STUDENTS: Error> Org with id ${org_id} does not exist.`)
      res.json({
        success: false,
        error: `Course with id ${org_id} could not be found`
      })
    }
    else {

      let invite_promises = []
      users.forEach(user => {
        invite_promises.push(inviteStudentToCourse(org_doc, user.first_name, user.last_name, user.email))
      })

      Promise.all(invite_promises).then(async (successful_invite) => {
        console.log(`Successfully invited ${successful_invite.length} students to the course.`)
        
        await org_doc.save ()
        
        res.json({
          success: true,
          data: {
            course: org_doc,
            invites: successful_invite
          }
        })
      })
      .catch(err => {
        console.log(`<INVITE/STUDENTS: Error> An error occurred while trying to invite a student to the course`)
        console.log(err)
        res.json({
          success: false,
          error: err
        })
      })

    }
  })
})

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
  populate({
    path: 'meetings',
    populate: [{
      path: 'live_attendance'
    }, {
      path: 'async_attendance'
    }]
  }).
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
