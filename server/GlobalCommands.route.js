const express = require('express');
const globalCommandRoutes = express.Router();
const Course = require('./Course/Course.model');
const NotificationJob =
require('./Notification/NotificationJob.model');
const RealTimePortion =
require('./RealTimePortion/RealTimePortion.model');

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

globalCommandRoutes.post('/change_notification_job_instructor_to_array',
  function(req, res, next) {
  NotificationJob.find(async function(error, notification_jobs) {
    if(error) {
      console.log("<ERROR> (global_commands/"
        + "change_notification_job_instructor_to_array) finding"
        + " notification_jobs")
      next(error)
    } else {
      try {
        notifcation_job_update_promises = []
        notification_jobs.forEach(notification_job => {
          if(notification_job._doc.primary_instructor_id != null) {
            notifcation_job_update_promises.push(new Promise(
              async (resolve,reject) => {
                try {
                  notification_job.instructor_ids = [
                    notification_job._doc.primary_instructor_id]
                  notification_job.set('primary_instructor_id',
                    undefined, {strict: false})
                  notification_job.set('secondary_instructor_id',
                    undefined, {strict: false})
                  if(notification_job._doc.qr_scan_id == null)
                    notification_job.qr_scan_id = "null"
                  const saved_notification_job = await notification_job.save()
                  resolve(saved_notification_job)
                } catch(error) {
                  console.log("<ERROR> (global_commands/"
                    + "change_notification_job_instructor_to_array) "
                    + "saving notification_job",
                    error)
                  reject(null)
                }
              })
            )
          }
        })
        const updated_notification_jobs = await Promise.all(
          notifcation_job_update_promises)
        console.log("<SUCCESS> (global_commands/"
          + "change_notification_job_instructor_to_array)")
        res.json(updated_notification_jobs)
      } catch(error) {
        console.log("<ERROR> (global_commands/"
          + "change_notification_job_instructor_to_array)")
        next(error)
      }
    }
  })
  }
)

globalCommandRoutes.post('/add_quizzes_to_real_time_portions',
  function(req, res, next) {
  RealTimePortion.updateMany({},
    {quizzes: []},
    {new: true},
    (error, updated_real_time_portions) => {
      if(error) {
        console.log("<ERROR> (global_commands/"
          + "add_quizzes_to_real_time_portions) updating real_time_portions")
        next(error)
      } else {
        console.log("<SUCCESS> (global_commands/"
          + "add_quizzes_to_real_time_portions) updating real_time_portions")
        res.json(updated_real_time_portions)
      }
    }
  )
  }
)

module.exports = globalCommandRoutes;