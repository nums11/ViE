const express = require('express');
const globalCommandRoutes = express.Router();
const Course = require('./Course/Course.model');

globalCommandRoutes.post('/change_course_instructor_to_array',
  function(req, res, next) {
  Course.find(async function(error, courses) {
    if(error) {
      console.log("<ERROR> (global_commands/"
        + "change_course_instructor_to_array) finding courses")
      next(error)
    } else {
      try {
        course_update_promises = []
        courses.forEach(course => {
          if(course._doc.instructor != null) {
            course_update_promises.push(new Promise(
              async (resolve,reject) => {
                try {
                  course.instructors = [course._doc.instructor]
                  course.set('instructor', undefined, {strict: false})
                  const saved_course = await course.save()
                  resolve(saved_course)
                } catch(error) {
                  console.log("<ERROR> (global_commands/"
                    + "change_course_instructor_to_array) saving course",
                    error)
                  reject(null)
                }
              })
            )
          }
        })
        const updated_courses = await Promise.all(course_update_promises)
        console.log("<SUCCESS> (global_commands/"
          + "change_course_instructor_to_array)")
        res.json(updated_courses)
      } catch(error) {
        console.log("<ERROR> (global_commands/"
          + "change_course_instructor_to_array)")
        next(error)
      }
    }
  })
  }
)

module.exports = globalCommandRoutes;