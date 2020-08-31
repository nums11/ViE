const express = require('express');
const userRoutes = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const _ = require('lodash')

let User = require('./User.model');
let Course = require('../Course/Course.model');
let Organization = require('../Organization/Organization.model');
let Section = require('../Section/Section.model');
let Lecture = require('../Lecture/Lecture.model');

userRoutes.route('/change_password/:user_id').post((req, res) => {
  let new_password = req.body.password
  let user_id = req.params.user_id

  if (!new_password) {
    console.log(`<USER/Change Pass: Error> No new password found`)
    res.json({
      success: false,
      error: `No new password found`
    })
    return;
  }

  if (!user_id) {
    console.log(`<USER/Change Pass: Error> No user id found`)
    res.json({
      success: false,
      error: `No user id found`
    })
    return;
  }

  User.findById(user_id, (err, user_doc) => {

    if (err || !user_doc) {
      res.json({
        success: false,
        error: `No user id found for id ${user_id}`
      })
    }
    else {

      bcrypt.hash(new_password, saltRounds, (err, hash) => {
        if (err || hash == null) {
          console.log(`<USER/Change Password: Error> Filed to hash password`)
          res.json(err)
        }
        else {
          user_doc.password = hash
          await user_doc.save ()

          console.log(`<User/Change Pass> Successfully changed password!`)
          res.json({
            success: true
          })
        }
      })
    }
  })

})

userRoutes.route('/add').post(function (req, res) {
  let user = new User(req.body.user);
  bcrypt.hash(user.password, saltRounds, (err, hash) => {
    if(err || hash == null) {
      console.log("<ERROR> Hashing password for user:",user)
      res.json(err)
    } else {
      user.password = hash
      user.save()
        .then(() => {
          console.log("<SUCCESS> Adding user:",user)
          res.status(200).json(user);
        })
        .catch(() => {
          console.log("<ERROR> Adding user:",user)
          res.status(400).send("unable to save user to database");
        });
    }
  });
});

userRoutes.route('/onboard').post(function (req, res) {
  let new_user = new User(req.body.user);
  User.find({user_id: new_user.user_id}, (error, existing_users) => {
    if(error || existing_users == null){
      console.log("<ERROR> Onboarding new user with user_id:", new_user.user_id)
      res.json(error)
    } else {
      if(existing_users.length === 0) {
        new_user.save()
          .then(() => {
            console.log("<SUCCESS> Onboarding user:",new_user)
            res.status(200).json(new_user);
          })
          .catch(() => {
            console.log("<ERROR> Onboarding user:",new_user)
            res.status(400).send("unable to save user to database");
          });
      } else {
        res.status(403).json("User with user_id " + new_user.user_id + " already exists")
      }
    }
  })
});

userRoutes.get('/', (req, res) => {
  User.find(function(err, users){
    if(err || users == null) {
      console.log("<ERROR> Getting all users")
      res.json(err);
    } else {
      console.log("<SUCCESS> Getting all users")
      res.json(users);
    }
  })
})

userRoutes.route('/get/:id').get(function (req, res) {
  let id = req.params.id;
  User.findById(id).
  populate('instructor_courses').
  populate('student_courses').
  populate('user_orgs').
  populate({
    path: 'meetings',
    populate: [{
      path: 'course',
    }, {
      path: 'org'
    }, {
      path: 'live_attendance',
    }, {
      path: 'async_attendance',
      populate: {
        path: 'recordings'
      }
    }]
  }).
  populate('live_submissions').
  populate('async_submissions').
  exec((error,user) => {
    if(error || user == null){
      console.log("<ERROR> (users/get) Getting user with ID:",id,error)
      res.status(404).json(error);
    } else {
      console.log("<SUCCESS> (users/get) Getting user by ID:",id)
      res.json(user);
    }
  })
});

userRoutes.route('/change_password/').post((req, res) => {

  let user_id = req.body.user_id
  let old_password = req.body.old_password
  let new_password = req.body.new_password

  User.findOne({_id: user_id}, (err, user) => {
    if (err || user == null) {
      console.log(`<ERROR> Error changing password for ${user_id}`)
      res.json(false)
    }
    else {
      bcrypt.compare(old_password, user.password, (err, result) => {
        if (result) {
          // update the password
          bcrypt.hash(new_password, saltRounds, (err, hash) => {
            user.password = hash
            user.save ()
            res.json(true)
          })
        }
        else {
          res.json(false)
        }
      })
    }
  })

})

userRoutes.route('/update/:id').post(function (req, res) {
  let id = req.params.id;
  let updated_user = req.body.updated_user;
  User.findByIdAndUpdate(id,
    {
      first_name: updated_user.first_name,
      last_name: updated_user.last_name,
      email: updated_user.email,
      password: updated_user.password,
      is_instructor: updated_user.is_instructor,
      ta_sections: updated_user.ta_sections,
      submissions: updated_user.submissions
    },
    function(err, user) {
      if (err || user == null) {
        console.log("<ERROR> Updating user by ID:",id,"with:",updated_user)
        res.status(404).send("user not found");
      } else {
        console.log("<SUCCESS> Updating user by ID:",id,"with:",updated_user)
        res.json(user);
      }
    }
  );
});

userRoutes.route('/delete/:id').delete(function (req, res) {
  User.findByIdAndRemove({_id: req.params.id}, function(err){
    if(err) {
      console.log("<ERROR> Deleting user by ID:",req.params.id)
      res.json(err);
    } else {
      console.log("<SUCCESS> Deleting user by ID:",req.params.id)
      res.json('Successfully removed');
    }
  });
});

userRoutes.route('/course_for_invite/:user_id/:invite_key').get((req, res) => {

  let user_id = req.params.user_id
  let invite_key = req.params.invite_key

  if (!user_id) {
    console.log(`<USER/GET COURSE FOR INVITE:ERROR> No user id provided`)
    res.json({
      success: false,
      error: "No user id provided"
    })
    return;
  }

  if (!invite_key) {
    console.log(`<USER/GET COURSE FOR INVITE:ERROR> No invite key provided`)
    res.json({
      success: false,
      error: "No invite key provided"
    })
    return;
  }

  User.findById(user_id, (err, user_doc) => {

    if (err || !user_doc) {
      console.log(`<USER/GET COURSE FOR INVITE:ERROR> No user found with user id ${user_id}`)
      res.json({
        success: false,
        error: `No user for id ${user_id}`
      })
    }
    else {
      if (!_.has(user_doc.toObject (), 'pending_course_invites')) {
        console.error(`<USER/GET COURSE FOR INVITE:ERROR> No pending invites for user ${user_doc._id}`)
        res.json({
          success: false,
          error: `No pending invite for user`
        })
      }
      else {

        let course_id = null
        user_doc.pending_course_invites.forEach(invite_data => {
          if (invite_data.invite_key == invite_key) course_id = invite_data.course_id
        })

        if (course_id == null) {
          console.error(`<USER/GET COURSE FOR INVITE:ERROR> No course found for invite key`)
          res.json({
            success: false,
            error: `No course found for invite key`
          })
        }
        else {
          Course.findById(course_id, (err, course_doc) => {
            if (err || !course_doc) {
              console.log(`<USER/GET COURSE FOR INVITE:ERROR> No course found for id ${course_id}`)
              res.json({
                success: false,
                error: `No course found for id ${course_id}`
              })
            }
            else {
              res.json({
                success: true,
                data: course_doc
              })
            }
          })
        }

      }

    }

  })

})

userRoutes.route('/org_for_invite/:user_id/:invite_key').get((req, res) => {

  let user_id = req.params.user_id
  let invite_key = req.params.invite_key

  if (!user_id) {
    console.log(`<USER/GET ORG FOR INVITE:ERROR> No user id provided`)
    res.json({
      success: false,
      error: "No user id provided"
    })
    return;
  }

  if (!invite_key) {
    console.log(`<USER/GET ORG FOR INVITE:ERROR> No invite key provided`)
    res.json({
      success: false,
      error: "No invite key provided"
    })
    return;
  }

  User.findById(user_id, (err, user_doc) => {

    if (err || !user_doc) {
      console.log(`<USER/GET ORG FOR INVITE:ERROR> No user found with user id ${user_id}`)
      res.json({
        success: false,
        error: `No user for id ${user_id}`
      })
    }
    else {

      if (!_.has(user_doc.toObject(), 'pending_org_invites')) {
        console.error(`<USER/GET ORG FOR INVITE:ERROR> No pending invites for user ${user_doc._id}`)
        res.json({
          success: false,
          error: `No pending invite for user`
        })
      }
      else {

        let org_id = null
        user_doc.pending_org_invites.forEach(invite_data => {
          if (invite_data.invite_key == invite_key) org_id = invite_data.org_id
        })

        if (org_id == null) {
          console.error(`<USER/GET ORG FOR INVITE:ERROR> No org found for invite key`)
          res.json({
            success: false,
            error: `No org found for invite key`
          })
        }
        else {
          Organization.findById(org_id, (err, org_doc) => {
            if (err || !org_doc) {
              console.log(`<USER/GET ORG FOR INVITE:ERROR> No org urse found for id ${org_id}`)
              res.json({
                success: false,
                error: `No org found for id ${org_id}`
              })
            }
            else {
              res.json({
                success: true,
                data: org_doc
              })
            }
          })
        }

      }

    }

  })

})

userRoutes.route('/instructors').get(function (req, res) {
  User.find({is_instructor: true},function(err, instructors){
    if(err || instructors == null) {
      console.log("<ERROR> Getting instructors")
      res.json(err);
    } else {
      console.log("<SUCCESS> Getting instructors")
      res.json(instructors);
    }
  });
});

userRoutes.route('/students').get(function (req, res) {
  User.find({is_instructor: false},function(err, students){
    if(err || students == null) {
      console.log("<ERROR> Getting students")
      res.json(err);
    } else {
      console.log("<SUCCESS> Getting students")
      res.json(students);
    }
  });
});

userRoutes.route('/instructor_courses/:id').get(function (req, res) {
  let instructor_id = req.params.id;
  Course.find({instructor: instructor_id},function(err, courses){
    if(err || courses == null) {
      console.log("<ERROR> Getting courses for instructor with ID:",instructor_id)
      res.json(err);
    } else {
      console.log("<SUCCESS> Getting courses for instructor with ID:",instructor_id)
      res.json(courses);
    }
  });
});

userRoutes.route('/student_sections/:id').get(function (req, res) {
  let student_id = req.params.id;
  Section.find(function(err, sections){
    if(err || sections == null) {
      console.log("<ERROR> Getting all sections")
      res.json(err);
    } else {
      let student_sections = []
      let n = 0
      sections.forEach((section) => {
        n++
        let m = 0
        section.students.forEach((section_student) => {
          m++
          if(section_student._id == student_id){
            student_sections.push(section);
          }
          if(n == sections.length && m == section.students.length) {
            console.log("<SUCCESS> Getting sections for student with ID:",student_id)
            res.json(student_sections);
          }
        });
      });
    }
  });
});

userRoutes.route('/students_for_course/:course_id').get(function (req, res) {
  let course_id = req.params.course_id;
  Section.find({course: course_id}, function(err, sections) {
    if(err || sections == null) {
      console.log("<ERROR> Getting students for course with ID:",course_id)
      res.json(err)
    } else {
      let students = []
      sections.forEach(section => {
        students.push(new Promise((resolve,reject) => {
          User.find({_id: {$in: section.students}},function(err,studs) {
            if(err || studs == null) {
              resolve(null)
            } else {
              resolve(studs)
            }
          })
        }))
      })
      Promise.all(students)
      .then(resolved => {
        resolved = resolved.filter(stud => stud != null)
        let studs = new Map()
        let ret = []
        resolved.forEach(section => {
          section.forEach(student => {
            if(!studs[student._id]) {
              studs[student._id] = student
              ret.push(student)
            }
          })
        })
        console.log("<SUCCESS> Getting students for course with ID:",course_id)
        res.json(ret)
      })
    }
  })
});

userRoutes.route('/students_for_lecture/:lecture_id').get(function (req, res) {
  let lecture_id = req.params.lecture_id;
  Lecture.findById(lecture_id,function(err,lecture){
    if(err || lecture == null) {
      console.log("<ERROR> Getting lecture with ID:",lecture_id)
    } else {
      let sections = lecture.sections;
      let sect_itr = 0;
      let students = [];
      sections.forEach(sect => {
        Section.findById(sect, function (err, section) {
          if(err || section == null) {
            console.log("<ERROR> Getting section with ID:",id)
            res.json(err);
          } else {
            let student_ids = section.students;
            let num_iterations = 0;
            student_ids.forEach(student_id => {
              User.findById(student_id, function(err, student) {
                if(err || student == null){
                  console.log("<ERROR> Getting user with ID:",student_id)
                  res.json(err);
                } else {
                  let found = false;
                  for(let i = 0; i < students.length; i++) {
                    if (students[i]._id.equals(student._id)) {
                      found = true;
                      break;
                    }
                  }
                  if(!found) {
                    students.push(student);
                  }
                  num_iterations++;
                  if(num_iterations === student_ids.length) {
                    sect_itr++
                    if(sect_itr == sections.length) {
                      console.log("<SUCCESS> Getting students for lecture with ID:",lecture_id)
                      res.json(students);
                    }
                  }
                }
              })
            })
          }
        })
      })
    }
  })
});

module.exports = userRoutes;
