const express = require('express');
const courseRoutes = express.Router();
const _ = require('lodash')
const mongoose = require('mongoose')
// const randomstring = require('randomstring')

let Course = require('./Course.model');
let Section = require('../Section/Section.model');
let User = require('../User/User.model');

courseRoutes.route('/add').post(async function (req, res, next) {
  let course = new Course(req.body.course);
  let sections = req.body.sections

  try {
    let new_course = await course.save()
    let updated_course_and_sections = await createSectionsAndAddToCourse(
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

// Broken because of change to sections... fix later
courseRoutes.route('/add_section/:course_id').post(
  async function (req, res, next) {
	const course_id = req.params.course_id
  let section = req.body.section
  try {
    const updated_course_and_sections = await
      createSectionsAndAddToCourse([section], course_id,
        "courses/add_section")
    if(updated_course_and_sections == null)
      throw "<ERROR> (courses/add_section)"
    const added_section = 
      updated_course_and_sections.saved_sections[0]
    res.json(added_section)
  } catch(error) {
    next(error)
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

courseRoutes.get('/get/:id/:with_meetings?',
  function (req, res, next) {
  const id = req.params.id;
  const with_meetings = req.params.with_meetings
  console.log("with_meetings", with_meetings)
  let meetings_population  = {
    path: ''
  }
  if(with_meetings != null) {
    meetings_population.path = 'meetings'
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

courseRoutes.route('/update/:id').post(
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

async function createSectionsAndAddToCourse(sections, course_id, route) {
    // Save Sections
  try {
    let section_promises = []
    sections.forEach(section => {
      section_promises.push(new Promise(async (resolve,reject) => {
        section.join_code = getJoinCodeForSection(section.section_number,
          course_id)
        section.course = course_id
        let new_section = new Section(section)
        try {
          let saved_section = await new_section.save()
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
    return {
      updated_course: updated_course,
      saved_sections: saved_sections
    }
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
