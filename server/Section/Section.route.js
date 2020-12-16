const express = require('express');
const sectionRoutes = express.Router();
const jwt = require('jsonwebtoken')
const ObjectID = require(`mongoose`).Types.ObjectId

let Section = require('./Section.model');
let User = require('../User/User.model');
let Course = require('../Course/Course.model');

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
  console.log("Section operation", section_operation)
  let student_operation;
  if(section_operation === "add_student")
    student_operation = "add_student_section"
  else if(section_operation === "add_pending_approval_student")
    student_operation = "add_pending_approval_section"
  else if(section_operation === "remove_student")
    student_operation = "remove_student_section"
  console.log("student operation", student_operation)
  try {
    const updated_section = await updateSection(section_id,
      section_operation, student_id)
    if(updated_section == null)
      throw "<ERROR> (courses/handle_student)"
    const updated_student = await updateStudent(student_id,
      student_operation, updated_section)
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
    const updated_section = await updateSection(section_id,
      operation, student_id)
    if(updated_section == null)
      throw "<ERROR> (courses/handle_enrollment)"
    const updated_student = await updateStudent(student_id,
      operation, updated_section)
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

async function updateSection(section_id, operation, student_id) {
  let update_block = {
    pull_block: {},
    push_block: {}
  }
  if(operation === "add_student") {
    update_block.push_block.students = student_id
  } else if(operation === "add_pending_approval_student") {
    update_block.push_block.pending_approval_students = student_id
  } else if(operation === "approve_student") {
    update_block.pull_block.pending_approval_students = student_id
    update_block.push_block.students = student_id
  } else if(operation === "deny_student") {
    update_block.pull_block.pending_approval_students = student_id
  } else if(operation === "remove_student") {
    update_block.pull_block.students = student_id
  }
  console.log("In updateSection", update_block)

  try {
    let update_promise = new Promise((resolve, reject) => {
      Section.findByIdAndUpdate(section_id,
        {
          $push: update_block.push_block,
          $pull: update_block.pull_block
        },
        {new: true},
        (error, updated_section) => {
          if(error) {
            console.log(`<ERROR> updating section with id ${section_id}`
              + ` and update_block`, update_block)
            reject(error)
          } else {
            resolve(updated_section)
          }
        }
      )
    })
    const updated_section = await Promise.resolve(update_promise)
    return updated_section
  } catch(error) {
    console.log(`<ERROR> updateSection with section_id: ${section_id},` +
      ` operation: '${operation}', student_id: ${student_id}`, error)
    return null
  }
}

async function updateStudent(student_id, operation, section) {
  let update_block = {
    pull_block: {},
    pull_all_block: {},
    push_block: {}
  }
  if(operation === "add_student_section") {
    update_block.push_block.student_sections = section._id
    update_block.push_block.meetings = section.meetings
  } else if(operation === "add_pending_approval_section") {
    update_block.push_block.pending_approval_sections = section._id
  } else if(operation === "approve_student") {
    update_block.pull_block.pending_approval_sections = section._id
    update_block.push_block.student_sections = section._id
    update_block.push_block.meetings = section.meetings
  } else if(operation === "deny_student") {
    update_block.pull_block.pending_approval_sections = section._id
  } else if(operation === "remove_student_section") {
    update_block.pull_block.student_sections = section._id
    update_block.pull_all_block.meetings = section.meetings
  }
  console.log("In updateStudent", update_block)

  try {
    let update_promise = new Promise((resolve, reject) => {
      User.findByIdAndUpdate(student_id,
        {
          $push: update_block.push_block,
          $pull: update_block.pull_block,
          $pullAll: update_block.pull_all_block
        },
        {new: true},
        (error, updated_student) => {
          if(error) {
            console.log(`<ERROR> updating student with id ${student_id}`
              + ` and update_block`, update_block)
            reject(error)
          } else {
            resolve(updated_student)
          }
        }
      )
    })
    const updated_student = await Promise.resolve(update_promise)
    return updated_student
  } catch(error) {
    console.log(`<ERROR> updateStudent with student_id: ${student_id},` +
      ` operation: '${operation}', section_id: ${section._id}`, error)
    return null
  }
}

module.exports = sectionRoutes;
