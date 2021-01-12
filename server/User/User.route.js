const express = require('express');
const userRoutes = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;

let User = require('./User.model');
let Course = require('../Course/Course.model');
let Section = require('../Section/Section.model');

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
            console.log("<SUCCESS> Onboarding user with id",new_user._id)
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

userRoutes.route('/get/:id/:with_meetings?').get(
  function(req, res, next) {
  let meeting_population = null
  if(req.params.with_meetings === "true"){
    meeting_population = {
      path: 'meetings',
      populate: [{
        path: 'sections',
        populate: {
          path: 'course'
        }
      }, {
        path: 'real_time_portion',
      }, {
        path: 'async_portion',
        populate: {
          path: 'videos'
        }
      }]
    }
  }

  let id = req.params.id;
  User.findById(id).
  populate('instructor_courses').
  populate({
    path: 'student_sections',
    populate: {
      path: 'course'
    }
  }).
  populate(meeting_population).
  populate('submissions').
  populate('async_submissions').
  populate({
    path: 'pending_approval_sections',
    populate: {
      path: 'course'
    }
  }).
  exec((error,user) => {
    if(error){
      console.log(`<ERROR> (users/get) Getting user with ID ${id}`)
      next(error)
    } else if(user == null) {
      console.log(`<ERROR> (users/get) could not find user with id ${id}`)
      res.status(404).send(`User with id ${id} not found`)
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
      user_id: updated_user.user_id,
      is_instructor: updated_user.is_instructor,
    },
    function(err, user) {
      if (err || user == null) {
        console.log("<ERROR> (users/update) Updating user by ID:",id,"with:",updated_user)
        res.json(err)
      } else {
        console.log("<SUCCESS> (users/update) Updating user by ID:",id)
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

userRoutes.post('/add_service_worker_subscription/:user_id', (req, res) => {
  let user_id = req.params.user_id
  let subscription = req.body.subscription
  User.findById(user_id, (error, user) => {
    if (error || user == null) {
      console.log("<ERROR> (users/add_service_worker_subscription) Finding user by ID:",
        user_id, error)
      res.json(error)
    } else {
      let subscription_exists = false
      for(let i = 0; i < user.service_worker_subscriptions.length; i++) {
        let existing_subscription = user.service_worker_subscriptions[i]
        if(existing_subscription.endpoint === subscription.endpoint) {
          subscription_exists = true
          break
        }
      }
      if(subscription_exists) {
        console.log("<SUCCESS> (users/add_service_worker_subscription) subscription exists",
          " - no updated needed")
        res.json(user)
      } else {
        User.findByIdAndUpdate(user_id,
          {$push: {service_worker_subscriptions: subscription}},
          {new: true},
          (error, user) => {
            if (error || user == null) {
              console.log("<ERROR> (users/add_service_worker_subscription) Updating user by ID:",
                user_id, error)
              res.json(error)
            } else {
              console.log("<SUCCESS> (users/add_service_worker_subscription) Updating user")
              res.json(user)
            }
          }
        )
      }
    }
  })
})

userRoutes.post('/add_service_worker_subscriptions_to_all', (req, res) => {
  User.find(async (err, users) => {
    if(err || users == null) {
      console.log("<ERROR> Getting all users")
      res.json(err);
    } else {
      let user_promises = []
      users.forEach(user => {
        user_promises.push(new Promise((resolve, reject) => {
          User.findByIdAndUpdate(user._id,
            {
              service_worker_subscriptions: []
            },
            function(err, user) {
              if (err || user == null) {
                console.log("<ERROR> (users/add_service_worker_subscriptions_to_all) Updating user by ID:",
                  user._id, err)
                reject(err)
              } else {
                resolve(user);
              }
            }
          );
        }))
      })
      try{
        let updated_users = await Promise.all(user_promises)
        console.log("<SUCCESS> (users/add_service_worker_subscriptions_to_all) Updating all users")
        res.json(updated_users);
      } catch(error) {
        console.log("<ERROR> (users/add_service_worker_subscriptions_to_all) saving live attendance:"
          ,error)
        res.json(error)
      }
    }
  })
});

module.exports = userRoutes;
