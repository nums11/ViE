const express = require('express');
const sectionRoutes = express.Router();
const jwt = require('jsonwebtoken')
const ObjectID = require(`mongoose`).Types.ObjectId
const Section = require('./Section.model');
const User = require('../User/User.model');
const Course = require('../Course/Course.model');
const nodemailer = require("nodemailer");
const SectionHelper = require('../helpers/section_helper')
const UserHelper = require('../helpers/user_helper')

sectionRoutes.route('/add').post(function (req, res) {
  let section = new Section(req.body.section);
  section.save()
    .then(() => {
      console.log("<SUCCESS> Adding section:",section)
      res.status(200).json(section);
    })
    .catch(() => {
      console.log("<ERROR> Adding section:",section)
      res.status(400).send("unable to save section to database");
  });
});

sectionRoutes.route('/').get(function (req, res) {
  Section.find(function(err, sections){
    if(err || sections == null) {
      console.log("<ERROR> Getting all sections")
      res.json(err);
    } else {
      console.log("<SUCCESS> Getting all sections")
      res.json(sections);
    }
  });
});

sectionRoutes.route('/get/:id').get(function (req, res) {
  let id = req.params.id;
  Section.findById(id, function (err, section){
    if(err || section == null) {
      console.log("<ERROR> Getting section with ID:",id)
      res.json(err);
    } else {
			User.find({'_id': {$in: section.students}}, (error, students) => {
				if(error || students == null) {
					console.log("<ERROR> Getting students for section with ID:",id)
					res.status(404).json(err);
				} else {
					section.students = students
    			console.log("<SUCCESS> Getting section by ID:",id)
					res.json(section)
				}
			})
    }
  });
});

sectionRoutes.route('/update/:section_id').post(function (req, res) {
  const section_id = req.params.section_id;
  const new_section = req.body.new_section;
  Section.findByIdAndUpdate(section_id,
    {
      section_number: new_section.section_number,
      has_open_enrollment: new_section.has_open_enrollment
    },
    {new: true},
    function(error, updated_section) {
      if (error) {
        console.log("<ERROR> (secctions/update) Updating section with ID:",id,
         "with new_section",new_section)
        next(error);
      } else {
        console.log("<SUCCESS> (secctions/update) Updating section")
        res.json(updated_section);
      }
    }
  );
});

sectionRoutes.route('/update_section_number/:section_id').post(function (req, res) {
  let section_id = req.params.section_id;
  let updated_section_number = req.body.updated_section_number;
  Section.findByIdAndUpdate(section_id,
    {section_number: updated_section_number},
    function(err, section) {
      if (err || section == null) {
        console.log("<ERROR> (secctions/update_section_number) Updating section number"
         + "for section with ID:",id,"with section number",update_section_number, error)
        res.json(error);
      } else {
        console.log("<SUCCESS> (secctions/update_section_number) Updating section number")
        res.json(section);
      }
    }
  );
});

sectionRoutes.post('/handle_student/:section_id/:student_id/:operation',
  async (req, res, next) => {
  const section_id = req.params.section_id;
  const student_id = req.params.student_id;
  const section_operation = req.params.operation
  let student_operation;
  if(section_operation === "add_student")
    student_operation = "add_student_section"
  else if(section_operation === "add_pending_approval_student")
    student_operation = "add_pending_approval_section"
  else if(section_operation === "remove_student")
    student_operation = "remove_student_section"
  try {
    const updated_section = await SectionHelper.updateSection(
      section_id, section_operation, student_id)
    if(updated_section == null)
      throw "<ERROR> (courses/handle_student)"
    const updated_student = await UserHelper.updateStudent(
      student_id, student_operation, updated_section)
    if(updated_student == null)
      throw "<ERROR> (courses/handle_student)"
    console.log(`<SUCCESS> (courses/handle_student) ${section_operation}`)
    res.json(updated_section)
  } catch(error) {
    next(error)
  }
});

sectionRoutes.post('/handle_enrollment/:section_id/:student_id/:operation',
  async (req, res, next) => {
  const section_id = req.params.section_id;
  const student_id = req.params.student_id;
  const operation = req.params.operation
  try {
    const updated_section = await SectionHelper.updateSection(
      section_id, operation, student_id)
    if(updated_section == null)
      throw "<ERROR> (courses/handle_enrollment)"
    const updated_student = await UserHelper.updateStudent(
      student_id, operation, updated_section)
    if(updated_student == null)
      throw "<ERROR> (courses/handle_enrollment)"
    console.log(`<SUCCESS> (courses/handle_enrollment) with operation ${operation}`)
    res.json(updated_section)
  } catch(error) {
    next(error)
  }
});

sectionRoutes.get('/by_join_code/:join_code', (req, res, next) => {
  let join_code = req.params.join_code
  Section.find({join_code: join_code}).
  populate({
    path: 'course',
    populate: {
      path: 'sections',
      populate: {
        path: 'students'
      }
    }
  }).
  exec((error, sections) => {
      if(error) {
        console.log("<ERROR> (sections/by_join_code) getting section by join_code",join_code)
        next(error)
      } else if(sections.length === 0) {
        console.log("<ERROR> (sections/by_join_code) getting section by join_code",join_code,
          "no sections found")
        res.status(404).json("No sections with this join code found")
      } else {
        console.log("<SUCCESS> (sections/by_join_code) getting section by join_code")
        res.json(sections[0])
      }
    }
  )
});

sectionRoutes.route('/delete/:id').delete(function (req, res) {
  Section.findByIdAndRemove({_id: req.params.id}, function(err){
    if(err) {
      console.log("<ERROR> Deleting section with ID:",req.params.id)
      res.json(err);
    } else {
      console.log("<SUCCESS> Deleting section with ID:",req.params.id)
      res.json('Successfully removed');
    }
  });
});

sectionRoutes.route('/getInstructor/:id').get(function (req, res) {
  let id = req.params.id;
  Section.findById(id, function (err, section){
      if(err || section == null) {
        console.log("<ERROR> Getting section with ID:",id)
        res.json(err);
      } else {
        let course_id = section.course;
        Course.findById(course_id, function(error, course){
          if(error || course == null){
            console.log("<ERROR> Getting course with ID:",course_id)
            res.json(error);
          } else {
            let instructor_id = course.instructor;
            User.findById(instructor_id, function(error, instructor){
              if(error || instructor == null) {
                console.log("<ERROR> Getting user with ID:",instructor_id)
                res.json(error);
              } else {
                console.log("<SUCCESS> Getting instructor for section with ID:",id)
                res.json(instructor);
              }
            });
          }
        });
      }
  });
});

sectionRoutes.route('/getCourse/:id').get(function (req, res) {
  let id = req.params.id;
  Section.findById(id, function (err, section){
    if(err || section == null) {
      console.log("<ERROR> Getting section with ID:",id)
      res.json(err);
    } else {
      let course_id = section.course;
      Course.findById(course_id, function(error, course){
        if(error || course == null) {
          console.log("<ERROR> Getting course with ID:",course_id)
          res.json(error);
        } else {
          console.log("<SUCCESS> Getting course for section with ID:",id)
          res.json(course);
        }
      });
    }
  });
});

sectionRoutes.route('/getStudents/:id').get(function (req, res) {
  let id = req.params.id;
  Section.findById(id, function (err, section){
    if(err || section == null) {
      console.log("<ERROR> Getting section with ID:",id)
      res.json(err);
    } else {
      let student_ids = section.students;
      let students = [];
      let num_iterations = 0;
      console.log("student_ids: " + student_ids);
      student_ids.forEach(student_id => {
        User.findById(student_id, function(err, student) {
          if(err || student == null){
            console.log("<ERROR> Getting user with ID:",student_id)
            res.json(err);
          } else {
            students.push(student);
            num_iterations++;
            if(num_iterations === student_ids.length) {
              console.log("<SUCCESS> Getting students for section with ID:",id)
              res.json(students);
            }
          }
        })
      })
    }
  })
})

sectionRoutes.get('/get_with_courses_for_student/:user_id', (req, res) => {
  let user_id = req.params.user_id
  user_sections = []
  Section.find((error, sections) => {
    if(error || sections == null) {
      console.log("<ERROR> Getting all sections")
      res.json(error)
    } else {
      sections.forEach((section) => {
        section.students.forEach((student) => {
          if(student._id == user_id)
            user_sections.push(section)
        })
      })
      let counter = 0
      user_sections.forEach((user_section) => {
        Course.findById(user_section.course, function (course_error, course){
          if(course_error || course == null) {
            console.log("<ERROR> Getting course with ID:",user_section.course)
            res.json(course_error);
          } else { 
            user_section.course = course
          }
          counter++
          if(counter === user_sections.length){
            console.log("<SUCCESS> Getting sections with courses for user with ID:",user_id)
            res.json(user_sections)
          }
        })
      })
    }
  })
})

sectionRoutes.get('/get_with_course/:section_id', (req, res) => {
  let section_id = req.params.section_id
  Section.findById(section_id, function (err, section){
    if(err || section == null) {
      console.log("<ERROR> Getting section with ID:",section_id)
      res.json(err);
    } else {
      Course.findById(section.course, function(error, course) {
        if(error || course == null) {
          console.log("<ERROR> Getting course with ID:",section.course)
          res.json(error)
        } else {
          section.course = course
          console.log("<SUCCESS> Getting section with course for section with ID:",section_id)
          res.json(section)
        }
      })
    }
  })
})

sectionRoutes.get('/get_for_course/:course_id', (req, res) => {
  let course_id = req.params.course_id
  Section.find((error, sections) => {
    if(error || sections == null) {
      console.log("<ERROR> Getting all sections")
      res.json(error)
    } else {
      let course_sections = []
      sections.forEach(section => {
        if(section.course == course_id)
          course_sections.push(section)
      })
      console.log("<SUCCESS> Getting all sections for course with ID:",course_id)
      res.json(course_sections)
    }
  })
})

sectionRoutes.post('/invite_student/:section_id/:student_id',
  async (req, res, next) => {
  const section_id = req.params.section_id
  const student_id = req.params.student_id
  const course_name = req.body.course_name
  const instructor_name = req.body.instructor_name
  try {
    const invite_code = generateRandomString()
    const updated_section = await SectionHelper.handleInvitedStudent(
      section_id, student_id, "add", invite_code)
    if(updated_section == null)
      throw "<ERROR> (sections/invite_student)"
    // Next actually send the email
    const invite_url = getInviteUrl(section_id,
      student_id, invite_code)
    const email_info = await sendInviteEmail(
      `${student_id}@rpi.edu`, invite_url, course_name,
      instructor_name, updated_section.section_number)
    if(email_info == null)
      throw "<ERROR> (sections/invite_student)"
    res.json(updated_section)
    console.log("<SUCCESS> (sections/invite_student)")
  } catch(error) {
    next(error)
  }
})

sectionRoutes.post('/cancel_invite/:section_id/:student_user_id/:invite_code',
  async (req, res, next) => {
  const section_id = req.params.section_id
  const student_user_id = req.params.student_user_id
  const invite_code = req.params.invite_code
  try {
    const updated_section = await SectionHelper.handleInvitedStudent(
      section_id, student_user_id, "remove", invite_code)
    if(updated_section == null){
      throw `<ERROR> (sections/cancel_invite) section_id: ${section_id},`
        + `student_user_id: ${student_user_id}, invite_code: ${invite_code}`
    }
    console.log("<SUCCESS> (sections/cancel_invite)")
    res.json(updated_section)
  } catch(error) {
    next(error)
  }
})


function generateRandomString() {
  let length = 10,
      charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      str = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
      str += charset.charAt(Math.floor(Math.random() * n))
  }
  return str
}

function getInviteUrl(section_id, student_id, invite_code) {
  const base_url = process.env.NODE_ENV === 'production' ?
  'https://byakugan.herokuapp.com/#/' : 'http://localhost:8080/#/'
  const invite_url = `${base_url}invite/${section_id}/${student_id}/${invite_code}`
  return invite_url
}

async function sendInviteEmail(student_email, invite_url, course_name,
  instructor_name, section_number) {
  let transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
     user: 'vie.do.not.reply@gmail.com',
     pass: process.env.EMAIL_PASS
   }
  });
  const subject = getEmailSubject(course_name, section_number)
  const body = getEmailBody(instructor_name, course_name,
    section_number, invite_url)
  let mailOptions = {
   from: 'vie.do.not.reply@gmail.com',
   to: student_email,
   subject: subject,
   html: body
  };
  try {
    let mail_promise = new Promise((resolve,reject) => {
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log("<ERROR> sending mail");
          reject(error)
        } else {
          resolve(info)
        }
      });
    })
    const info = await Promise.resolve(mail_promise)
    return info
  } catch(error) {
    console.log(`<ERROR> sendInviteEmail student_email: ${student_email}`
      + `invite_url: ${invite_url}`, error)
    return null
  }
}

function getEmailSubject(course_name, section_number) {
  const email_subject = `ViE - ${course_name}`
    + ` Section ${section_number} Course Invite`
  return email_subject
}

function getEmailBody(instructor_name, course_name,
  section_number, invite_url) {
  const email_body = `<p>${instructor_name} invited you to join their course`
    + ` <strong>${course_name} Section ${section_number}.</strong>`
    + `<br/><br/>`
    + `To join click this link: ${invite_url}`
    + `<br/><br/>`
    + `--<br/>`
    + `ViE - Virtually Engage</p>`
  return email_body
}

module.exports = sectionRoutes;
