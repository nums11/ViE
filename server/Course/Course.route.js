const express = require('express');
const courseRoutes = express.Router();
const Course = require('./Course.model');
const Section = require('../Section/Section.model');
const User = require('../User/User.model');
const CourseHelper = require('../helpers/course_helper')
const UserHelper = require('../helpers/user_helper')
const SectionHelper = require('../helpers/section_helper')

// GET --------------------

courseRoutes.get('/all', function (req, res, next) {
  Course.find()
  .populate('instructor')
  .exec(function (error, courses) {
    if (error) {
      console.log("<ERROR> (courses/) Getting all courses")
      next(error)
    } else {
      console.log("<Success> (courses/) Getting all courses")
      res.json(courses);
    }
  });
});

courseRoutes.get('/get/:id/:with_meetings?',
  function (req, res, next) {
  const id = req.params.id;
  const with_meetings = req.params.with_meetings
  let meetings_population  = {
    path: ''
  }
  if(with_meetings != null) {
    meetings_population = {
      path: 'meetings',
      populate: [
        {
          path: 'real_time_portion'
        },
        {
          path: 'async_portion'
        }
      ]
    }
  }

  Course.findById(id).
  populate('instructor').
  populate('secondary_instructor').
  populate({
    path: 'sections',
    populate: [
      meetings_population,
      {
        path: 'students'
      },
      {
        path: 'pending_approval_students'
      }
    ]
  }).
  exec((error,course) => {
    if(error || course == null){
      next(error)
    } else if(course == null) {
      console.log(`<ERROR> (courses/get) Getting course with ID ${id}`
        + ` with_meetings ${with_meetings} course not found`)
      res.status(404).json("Course not found");
    } else {
      console.log(`<SUCCESS> (courses/get) Getting course by ID ${id}`
        + ` with_meetings ${with_meetings}`)
      res.json(course)
    }
  })
});

// POST --------------------

courseRoutes.post('/add', async function (req, res, next) {
  let course = new Course(req.body.course);
  let sections = req.body.sections

  try {
    let new_course = await course.save()
    let updated_course_and_sections = 
      await CourseHelper.createSectionsAndAddToCourse(
      sections, new_course._id, "courses/add")
    if(updated_course_and_sections == null)
      throw "<ERROR> (courses/add)"
    updated_course = updated_course_and_sections.updated_course

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
    next(error)
  }
});

courseRoutes.post('/add_section/:course_id',
  async function (req, res, next) {
	const course_id = req.params.course_id
  let section = req.body.section
  try {
    const updated_course_and_sections = await
      CourseHelper.createSectionsAndAddToCourse([section],
        course_id, "courses/add_section")
    if(updated_course_and_sections == null)
      throw "<ERROR> (courses/add_section)"
    const added_section = 
      updated_course_and_sections.saved_sections[0]
    res.json(added_section)
  } catch(error) {
    next(error)
  }
});

courseRoutes.post('/update/:id',
  async function (req, res, next) {
  const id = req.params.id;
  const course = req.body.course;

  try {
    let section_promises = []
    course.sections.forEach(section => {
      section_promises.push(new Promise((resolve, reject) => {
        Section.findByIdAndUpdate(section._id,
          {
            section_number: section.section_number,
            has_open_enrollment: section.has_open_enrollment
          },
          {new: true},
          (error, updated_section) => {
            if(error) {
              console.log(`<ERROR> (courses/update) updating section`
                + ` with id: ${section._id} and section`,section,error)
              reject(error)
            } else if(updated_section == null) {
              console.log(`<ERROR> (courses/update) section not found`
                + ` with id ${section._id}`)
              reject(null)
            } else {
              resolve(updated_section)
            }
          }
        )
      }))
    })
    let course_promise = new Promise((resolve,reject) => {
      Course.findByIdAndUpdate(id,
        {
          name: course.name,
          dept: course.dept,
          course_number: course.course_number,
        },
        {new: true},
        function (error, updated_course) {
          if (error) {
            console.log(`<ERROR> (courses/update) updating course`
              + ` with id ${id} and course`,course,error)
            reject(error)
          } else if(updated_course == null) {
            console.log(`<ERROR> (courses/update) could not find course`
              + ` with id ${id}`)
            reject(null)
          } else {
            resolve(updated_course)
          }
        }
      );
    })
    const updated_sections = await Promise.all(section_promises)
    const updated_course = await Promise.resolve(course_promise)
    console.log("<SUCCESS> (courses/update)")
    res.json({
      updated_sections: updated_sections,
      updated_course: updated_course
    })
  } catch(error) {
    console.log("<ERROR> (courses/update)")
    next(error)
  }
});

// DELETE ---------------

courseRoutes.delete('/delete/:course_id',
  async function (req, res, next) {
  const course_id = req.params.course_id
  const sections = req.body.sections
  const meeting_ids = req.body.meeting_ids
  const instructor_id = req.body.instructor_id
  const course = {
    _id: course_id,
    meetings: meeting_ids
  }

  try {
    // Remove course and course meetings from instructor
    const updated_instructor_promise = UserHelper.updateUser(
      instructor_id, "remove_instructor_course", null, course)
    console.log("Promise", updated_instructor_promise)
    if(updated_instructor_promise == null)
      throw `<ERROR> (courses/delete) removing instructor course`
    // Delete all the sections 
    let section_deletion_promises = []
    section_deletion_promises.push(new Promise((resolve,reject) => {
      sections.forEach(async section => {
        try {
          const result = await SectionHelper.deleteSection(section._id,
            section.meeting_ids, section.student_ids,
            section.pending_approval_student_ids, instructor_id,
            course_id)
          if(result)
            resolve(result)
          else {
            console.log("<ERROR> (courses/delete) deleting section")
            reject(result)
          }
        } catch(error) {
          console.log("<ERROR> (courses/delete) deleting section",
            error)
          reject(error)
        }
      })
    }))
    // Delete the course
    const course_deletion_promise = new Promise((resolve,reject) => {
      Course.findByIdAndRemove(course_id, function (error) {
        if (error) {
          console.log(`<ERROR> (courses/delete) Deleting course with`
            + ` ID: ${course_id}`, error)
          reject(error)
        } else {
          resolve(true)
        }
      });
    })
    const all_promises = [].concat.apply([], [
      [updated_instructor_promise, course_deletion_promise],
      section_deletion_promises])
    await Promise.all(all_promises)
    console.log("<SUCCESS> (courses/delete)")
    res.json()
  } catch(error) {
    console.log(`<ERROR> (courses/delete) course_id ${course_id}`,
      `sections`, sections, `meeting_ids`, meeting_ids,
      `instructor_id ${instructor_id}`, error)
    next(error)
  }
});

module.exports = courseRoutes;
