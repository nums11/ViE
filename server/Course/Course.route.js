const express = require('express');
const courseRoutes = express.Router();
const _ = require('lodash')
const mongoose = require('mongoose')
// const randomstring = require('randomstring')

let Course = require('./Course.model');
let Section = require('../Section/Section.model');
let User = require('../User/User.model');

const inviteStudentToCourseCAS = async (course_doc, first_name, last_name, user_id) => {

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
    if (user_id == null) {
      reject({
        error: 'No user_id provided'
      })
    }
    if (course_doc == null) {
      reject({
        error: 'No course document provided.'
      })
    }

    // Check if the user exists in the database
    User.findOne({ user_id: user_id }, async (err, user_doc) => {
      if (err) {
        reject ({
          error: `Error querying user with user_id ${user_id}`
        })
      }
      else if (user_doc) {
        // User exists
        
        // if the student is not already in the course ...
        if (course_doc.students.indexOf( user_doc._id ) == -1) {

          // add to the course and add the course to the student's user document
          course_doc.students.push(user_doc._id)
          user_doc.student_courses.push(course_doc._id)

          // let invite_key_ = mongoose.Types.ObjectId()
          // if (_.has(user_doc, 'pending_course_invites')) {
          //   user_doc.pending_course_invites.push({
          //     course_id: course_doc._id,
          //     // invite_key: invite_key_
          //   })
          // }
          // else {
          //   user_doc.pending_course_invites = [{
          //     course_id: course_doc._id,
          //     // invite_key: invite_key_
          //   }]
          // }

          // await course_doc.save ()
          user_doc.save ()

          // TODO send email to student informing them that they have
          // been invited to this course.
          // sendInviteEmail(first_name, last_name, email, course_doc.name, user_doc._id, invite_key_)

          resolve ({
            response: `Student with user_id [${user_id}] has been invited to course ${course_doc.name}`,
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

        // let invite_key_ = mongoose.Types.ObjectId()
        // let confirm_key = randomstring.generate(64)
        let new_user = new User({
          first_name,
          last_name,
          user_id: user_id,
          email: `${user_id}@rpi.edu`,
          student_courses: [course_doc._id],
          // pending_course_invites: [{
          //   course_id: course_doc._id,
          //   // invite_key: invite_key_
          // }]
        })
        let saved_user = await new_user.save ()

        // add the course to the student's list and the student to the course
        course_doc.students.push(saved_user._id)
        // await course_doc.save ()

        // TODO send email to student informing them that they have been added
        // to the course
        // sendInviteEmail(first_name, last_name, email, course_doc.name, saved_user._id, invite_key_, confirm_key)
        
        resolve ({
          response: `Student with user_id [${user_id}] has been invited to course ${course_doc.name}`,
          user_status: `new`,
          user: saved_user
        })
      }
    })

  })

}

courseRoutes.route('/cas_invite_student/:course_id').post((req, res) => {

  if (!_.has(req.body, 'users')) {
    res.error('<INVITE/STUDENTS: Error> No users found in body.')
    res.json({
      success: false,
      error: 'No users found in body'
    })
    return;
  }

  let users = req.body.users
  let course_id = req.params.course_id

  Course.findById(course_id, (err, course_doc) => {
    if (err || !course_doc) {
      console.error(`<INVITE/STUDENTS: Error> Course with id ${course_id} does not exist.`)
      res.json({
        success: false,
        error: `Course with id ${course_id} could not be found`
      })
    }
    else {

      let invite_promises = []
      users.forEach(user => {
        invite_promises.push(inviteStudentToCourseCAS(course_doc, user.first_name, user.last_name, user.user_id))
      })

      Promise.all(invite_promises).then(async (successful_invite) => {
        console.log(`Successfully invited ${successful_invite.length} students to the course.`)
        
        await course_doc.save ()
        
        res.json({
          success: true,
          data: {
            course: course_doc,
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

courseRoutes.route('/add').post(async function (req, res, next) {
  let course = new Course(req.body.course);
  let section_numbers = req.body.section_numbers

  try {
    let new_course = await course.save()
    let updated_course = await createSectionsAndAddToCourse(
      section_numbers, new_course._id, "courses/add")
    if(updated_course == null)
      throw "Error in createSectionsAndAddToCourse"

    // Update the instructor with the new course
    let instructor_update_promise = new Promise((resolve, reject) => {
      User.findByIdAndUpdate(updated_course.instructor,
        {$push: {instructor_courses: updated_course}},
        {new: true},
        (error, updated_instructor) => {
          if(error) {
            console.log("<ERROR> (courses/add) Updating instructor with course",
              updated_instructor, error)
            reject(error)
          } else {
            resolve(updated_instructor)
          }
        }
      )
    })
    let updated_instructor = await Promise.resolve(instructor_update_promise)
    console.log("<SUCCESS> (courses/add) creating course")
    res.json(updated_course)
  } catch(error) {
    console.log("<ERROR> (courses/add)")
    next(error)
  }
});

courseRoutes.route('/add_student/:course_id/:student_id').post(function (req, res) {
  let course_id = req.params.course_id;
  let student_id = req.params.student_id;
  Course.findByIdAndUpdate(course_id,
    {$push: {students: student_id}},
    function (err, course) {
      if (err || course == null) {
        console.log("<ERROR> (courses/add_student) Updating course with id",
          course_id, err)
        res.status(400).json(err);
      } else {
        User.findByIdAndUpdate(student_id,
        {
          $push: {
            student_courses: course,
            meetings: {$each: course.meetings}
          },
        },
        (error, user) => {
          if (err || user == null) {
            console.log("<ERROR> (courses/add_student) Updating user with id",student_id,
              err)
            res.status(400).json(err);
          } else {
            console.log("Updated user",user)
            console.log("Course Meetings", course.meetings)
            console.log("<SUCCESS> (courses/add_student) Adding student with id",student_id,
              "to course with ID:",course_id)
            res.status(200).json(course);
          }
        })
      }
    }
  );
});

courseRoutes.route('/remove_student/:course_id/:student_id').post(function (req, res) {
  let course_id = req.params.course_id;
  let student_id = req.params.student_id;
  console.log()
  Course.findByIdAndUpdate(course_id,
    {$pull: {students: student_id}},
    function (err, course) {
      if (err || course == null) {
        console.log("<ERROR> (courses/remove_student) Updating course with id",
          course_id,err)
        res.status(400).json(err);
      } else {
        User.findByIdAndUpdate(student_id,
        {
          $pull: {
            student_courses: course_id,
            meetings: {$in: course.meetings}
          },
        },
        (error, user) => {
          if (err || user == null) {
            console.log("<ERROR> (courses/remove_student) Updating user with id",
              student_id,err)
            res.status(400).json(err);
          } else {
            console.log("Student courses",user.student_courses)
            console.log("<SUCCESS> (courses/remove_student) Removing student with id",student_id,
              "from course with ID:",course_id)
            res.status(200).json(course);
          }
        })
      }
    }
  );
});

courseRoutes.route('/add_secondary_instructor/:course_id/:instructor_id').post(function (req, res) {
  let course_id = req.params.course_id;
  let instructor_id = req.params.instructor_id;
  Course.findByIdAndUpdate(course_id,
    {secondary_instructor: instructor_id},
    function (err, course) {
      if (err || course == null) {
        console.log("<ERROR> (courses/add_secondary_instructor) Updating course with id",
          course_id, err)
        res.status(400).json(err);
      } else {
        User.findByIdAndUpdate(instructor_id,
        {
          $push: {
            instructor_courses: course,
            meetings: {$each: course.meetings}
          },
        },
        (error, user) => {
          if (err || user == null) {
            console.log("<ERROR> (courses/add_secondary_instructor) Updating instructor with id",instructor_id,
              err)
            res.status(400).json(err);
          } else {
            console.log("<SUCCESS> (courses/add_secondary_instructor) Adding instructor with id",instructor_id,
              "to course with ID:",course_id)
            res.status(200).json(course);
          }
        })
      }
    }
  );
});

courseRoutes.route('/remove_secondary_instructor/:course_id/:instructor_id').post(function (req, res) {
  let course_id = req.params.course_id;
  let instructor_id = req.params.instructor_id;
  Course.findByIdAndUpdate(course_id,
    {secondary_instructor: null},
    function (err, course) {
      if (err || course == null) {
        console.log("<ERROR> (courses/remove_secondary_instructor) Updating course with id",
          course_id, err)
        res.json(err);
      } else {
        User.findByIdAndUpdate(instructor_id,
        {
          $pull: {
            instructor_courses: course_id,
            meetings: {$in: course.meetings}
          },
        },
        (error, user) => {
          if (error || user == null) {
            console.log("<ERROR> (courses/remove_secondary_instructor) Updating instructor with id",instructor_id,
              error)
            res.json(error);
          } else {
            console.log("<SUCCESS> (courses/remove_secondary_instructor) Removing instructor with id",instructor_id,
              "from course with ID:",course_id)
            res.status(200).json(course);
          }
        })
      }
    }
  );
});

courseRoutes.route('/add_section/:course_id').post(async function (req, res) {
	let course_id = req.params.course_id
  let section_number = req.body.section_number
  try {
    let updated_course = await createSectionsAndAddToCourse(
      [section_number], course_id, "courses/add_section")
    if(updated_course == null)
      throw "Error in createSectionsAndAddToCourse"
    res.json(updated_course)
  } catch(error) {
    console.log("<ERROR> (courses/add_section)", error)
  }
});

courseRoutes.route('/').get(function (req, res) {
  Course.find(function (err, courses) {
    if (err || courses == null) {
      console.log("<ERROR> Getting all courses")
      res.json(err);
    } else {
      console.log("<Success> Getting all courses")
      res.json(courses);
    }
  });
});

courseRoutes.route('/get/:id/:with_meetings').get(function (req, res) {
  let id = req.params.id;
  let with_meetings = req.params.with_meetings === 'true'
  if(with_meetings) {
    Course.findById(id).
    populate('instructor').
    populate('secondary_instructor').
    populate({
      path: 'sections',
      populate: [{
        path: 'meetings',
        populate: [{
          path: 'live_attendance',
          populate: {
            path: 'qr_checkins',
            populate: {
              path: 'qr_checkin_submissions',
              populate: {
                path: 'submitter'
              }
            }
          }
        }, 
        {
          path: 'async_attendance',
          populate: {
            path: 'recordings',
            populate: {
              path: 'recording_submissions',
              populate: {
                path: 'submitter'
              }
            }
          }
        }]
      },{
        path: 'students'
      }]
    }).
    exec((error,course) => {
      if(error || course == null){
        console.log("<ERROR> (courses/get) Getting course with ID:",id, 
          "with meetings", error)
        res.status(404).json(error);
      } else {
        console.log("<SUCCESS> (courses/get) Getting course by ID:",id,
          "with meetings")
        res.json(course)
      }
    })
  } else {
    Course.findById(id).
    populate('instructor').
    populate('secondary_instructor').
    populate('sections').
    exec((error,course) => {
      if(error || course == null){
        console.log("<ERROR> (courses/get) Getting course with ID:",id, error)
        res.status(404).json(error);
      } else {
        console.log("<SUCCESS> (courses/get) Getting course by ID:",id)
        res.json(course)
      }
    })
  }
});

courseRoutes.route('/update/:id').post(function (req, res) {
  let id = req.params.id;
  let updated_course = req.body.updated_course;
  Course.findByIdAndUpdate(id,
    {
      name: updated_course.name,
      dept: updated_course.dept,
      course_number: updated_course.course_number,
      instructor: updated_course.instructor,
    },
    function (err, course) {
      if (err || course == null) {
        console.log("<ERROR> Updating course by ID:",id,"with:",updated_course)
        res.status(404).send("course not found");
      } else {
        console.log("<SUCCESS> Updating course by ID:",id,"with:",updated_course)
        res.json(course);
      }
    }
  );
});

// Todo update the instructor courses and student courses
courseRoutes.route('/delete/:id').delete(function (req, res) {
  Course.findByIdAndRemove({ _id: req.params.id }, function (err) {
    if (err) {
      console.log("<ERROR> Deleting course with ID:",req.params.id)
      res.json(err);
    } else {
      console.log("<SUCCESS> Deleting course with ID:",req.params.id)
      res.json('Successfully removed');
    }
  });
});

//Todo: change the id being passed to just be the instructor id
//and search for the instructor or remove this function entirely and use
//the userapis get user function
courseRoutes.route('/getInstructor/:id').get(function (req, res) {
  let id = req.params.id;
  Course.findById(id, function (err, course) {
    if (err || course == null) {
      console.log("<ERROR> Getting course with ID:",id)
      res.json(err);
    } else {
      let instructor_id = course.instructor;
      User.findById(instructor_id, function (error, instructor) {
        if (error || instructor == null) {
          console.log("<ERROR> Getting user with ID:",instructor_id)
          res.json(error);
        } else {
          console.log("<SUCCESS> Getting instructor for course with ID:",id)
          res.json(instructor);
        }
      });
    }
  });
});

courseRoutes.route('/get_instructor_courses/:user_id').get(function (req, res) {
  let user_id = req.params.user_id;
  Course.find({instructor: user_id}, function(err, instructor_courses) {
    if(err || instructor_courses == null) {
      console.log("<ERROR> Getting course by instructor with ID:",user_id)
      res.json(err)
    } else {
      console.log("<SUCCESS> Getting course by instructor with ID:",user_id)
      res.json(instructor_courses)
    }
  })
});

async function createSectionsAndAddToCourse(section_numbers, course_id, route) {
    // Save Sections
  try {
    let section_promises = []
    section_numbers.forEach(section_number => {
      section_promises.push(new Promise(async (resolve,reject) => {
        let join_code = getJoinCodeForSection(section_number, course_id)
        console.log("Join code", join_code)
        let section = new Section({
          course: course_id,
          section_number: section_number,
          join_code: join_code
        })
        try {
          let saved_section = await section.save()
          resolve(saved_section)
        } catch(error) {
          console.log(`<ERROR> (${route}) saving section`,section, error)
          reject(error)
        }
      }))
    })
    let saved_sections = await Promise.all(section_promises)

    // Update the course
    let course_update_promise = new Promise((resolve, reject) => {
      Course.findByIdAndUpdate(course_id,
        {$push: {sections: {$each: saved_sections}}},
        {new: true},
        (error, updated_course) => {
          if(error) {
            console.log(`<ERROR> (${route}) Updating course with new sections`,
              updated_course, error)
            reject(error)
          } else {
            resolve(updated_course)
          }
        }
      )
    })
    let updated_course = await Promise.resolve(course_update_promise)
    return updated_course
  } catch (error) {
    console.log(`<ERROR> createSectionsAndAddToCourse from ${route} route`,
      error)
    return null
  }
}

function getJoinCodeForSection(section_number, course_id) {
  let random_string = generateRandomString()
  return `${section_number}${course_id}${random_string}`
}

function generateRandomString() {
  let length = 10,
      charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      str = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
      str += charset.charAt(Math.floor(Math.random() * n))
  }
  return str
}

module.exports = courseRoutes;
