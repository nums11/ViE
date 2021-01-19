const express = require('express');
const sectionRoutes = express.Router();
const Section = require('./Section.model');
const User = require('../User/User.model');
const Course = require('../Course/Course.model');
const SectionHelper = require('../helpers/section_helper')
const UserHelper = require('../helpers/user_helper')

// GET --------------------

sectionRoutes.get('/', function (req, res) {
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

sectionRoutes.get('/by_join_code/:join_code', (req, res, next) => {
  let join_code = req.params.join_code
  Section.find({join_code: join_code}).
  populate({
    path: 'course',
    populate: [
      {
        path: 'sections',
        populate: {
            path: 'students'
        }
      },
      {
        path: 'instructor'
      }
    ]
  }).
  populate({
    path: 'pending_approval_students'
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

// POST --------------------

sectionRoutes.post('/handle_student/:section_id/:student_id/:operation',
  async (req, res, next) => {
  const section_id = req.params.section_id;
  const student_id = req.params.student_id;
  const section_operation = req.params.operation
  // Set the corresponding student operation for the given
  // section operation
  let student_operation;
  if(section_operation === "add_student")
    student_operation = "add_student_section"
  else if(section_operation === "add_pending_approval_student")
    student_operation = "add_pending_approval_section"
  else if(section_operation === "remove_student")
    student_operation = "remove_student_section"
  else if(section_operation === "approve_student")
    student_operation = "approve_student"
  else if(section_operation === "deny_student")
    student_operation = "deny_student"

  try {
    const updated_section = await SectionHelper.handleStudent(
      section_id, section_operation, student_id)
    if(updated_section == null)
      throw "<ERROR> (sections/handle_student)"
    const updated_student = await UserHelper.updateUser(
      student_id, student_operation, updated_section)
    if(updated_student == null)
      throw "<ERROR> (sections/handle_student)"
    console.log(`<SUCCESS> (sections/handle_student) ${section_operation}`)
    res.json(updated_section)
  } catch(error) {
    next(error)
  }
});

// DELETE --------------------

sectionRoutes.delete('/delete/:section_id',
  async function (req, res, next) {
  const section_id = req.params.section_id
  const meeting_ids = req.body.meeting_ids
  const student_ids = req.body.student_ids
  const pending_approval_student_ids =
    req.body.pending_approval_student_ids
  const instructor_id = req.body.instructor_id
  const course_id = req.body.course_id

  try {
    const result = await SectionHelper.deleteSection(section_id,
      meeting_ids, student_ids, pending_approval_student_ids,
      instructor_id, course_id)
    if(!result)
      throw "<ERROR> (sections/delete) deleting section"
    res.json("<SUCCESS> (sections/delete)")
  } catch(error) {
    next(error)
  }
});

module.exports = sectionRoutes;
