const express = require('express');
const migrationRoutes = express.Router();
const Course = require('./Course/Course.model');
const NotificationJob =
require('./Notification/NotificationJob.model');
const RealTimePortion =
require('./RealTimePortion/RealTimePortion.model');
const QuizQuestion =
require('./QuizQuestion/QuizQuestion.model');
const Submission = require('./Submission/Submission.model')

migrationRoutes.post('/change_course_instructor_to_array',
  function(req, res, next) {
  Course.find(async function(error, courses) {
    if(error) {
      console.log("<ERROR> (migrations/"
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
                  console.log("<ERROR> (migrations/"
                    + "change_course_instructor_to_array) saving course",
                    error)
                  reject(null)
                }
              })
            )
          }
        })
        const updated_courses = await Promise.all(course_update_promises)
        console.log("<SUCCESS> (migrations/"
          + "change_course_instructor_to_array)")
        res.json(updated_courses)
      } catch(error) {
        console.log("<ERROR> (migrations/"
          + "change_course_instructor_to_array)")
        next(error)
      }
    }
  })
  }
)

migrationRoutes.post('/change_notification_job_instructor_to_array',
  function(req, res, next) {
  NotificationJob.find(async function(error, notification_jobs) {
    if(error) {
      console.log("<ERROR> (migrations/"
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
                  console.log("<ERROR> (migrations/"
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
        console.log("<SUCCESS> (migrations/"
          + "change_notification_job_instructor_to_array)")
        res.json(updated_notification_jobs)
      } catch(error) {
        console.log("<ERROR> (migrations/"
          + "change_notification_job_instructor_to_array)")
        next(error)
      }
    }
  })
  }
)

migrationRoutes.post('/add_quizzes_to_real_time_portions',
  function(req, res, next) {
  RealTimePortion.updateMany({},
    {quizzes: []},
    {new: true},
    (error, updated_real_time_portions) => {
      if(error) {
        console.log("<ERROR> (migrations/"
          + "add_quizzes_to_real_time_portions) updating real_time_portions")
        next(error)
      } else {
        console.log("<SUCCESS> (migrations/"
          + "add_quizzes_to_real_time_portions) updating real_time_portions")
        res.json(updated_real_time_portions)
      }
    }
  )
  }
)

migrationRoutes.post('/change_correct_answer_index_to_array',
  function(req, res, next) {
  QuizQuestion.find(async function(error, questions) {
    if(error) {
      console.log("<ERROR> (migrations/"
        + "change_correct_answer_index_to_array) finding"
        + " quiz questions")
      next(error)
    } else {
      try {
        question_update_promises = []
        questions.forEach(question => {
          if(question._doc.correct_answer_index != null) {
            question_update_promises.push(new Promise(
              async (resolve,reject) => {
                try {
                  question.correct_answer_indices = [
                    question._doc.correct_answer_index]
                  question.set('correct_answer_index',
                    undefined, {strict: false})
                  const saved_question = await question.save()
                  resolve(saved_question)
                } catch(error) {
                  console.log("<ERROR> (migrations/"
                    + "change_correct_answer_index_to_array) "
                    + "saving quiz question",
                    error)
                  reject(null)
                }
              })
            )
          }
        })
        const updated_questions = await Promise.all(
          question_update_promises)
        console.log("<SUCCESS> (migrations/"
          + "change_correct_answer_index_to_array)")
        res.json(updated_questions)
      } catch(error) {
        console.log("<ERROR> (migrations/"
          + "change_correct_answer_index_to_array)")
        next(error)
      }
    }
  })
  }
)

migrationRoutes.post('/change_quiz_answer_indices_to_2d_array',
  function(req, res, next) {
  Submission.find(async function(error, submissions) {
    if(error) {
      console.log("<ERROR> (migrations/"
        + "change_quiz_answer_indices_to_2d_array) finding"
        + " submissions")
      next(error)
    } else {
      try {
        submission_update_promises = []
        let i = 1;
        submissions.forEach(submission => {
          console.log(`Submission number ${i}`)
          i++
          submission_update_promises.push(new Promise(
            (resolve, reject) => {
              let updated = false
              for(let i = 0; i < submission.quiz_answer_indices.length;
                i++) {
                if(submission.quiz_answer_indices[i].constructor
                  !== Array) {
                  submission.quiz_answer_indices[i] =
                    [submission.quiz_answer_indices[i]]
                }
              }
              Submission.findByIdAndUpdate(submission._id,
                {quiz_answer_indices: submission.quiz_answer_indices},
                {new: true},
                (error, updated_submission) => {
                  if(error) {
                    console.log("<ERROR> (migrations/"
                      + "change_quiz_answer_indices_to_2d_array) "
                      + "updating submission",
                      error)
                    reject(null)
                  } else {
                    resolve(updated_submission)
                  }
                }
              )
            })
          )
        })
        const updated_submissions = await Promise.all(
          submission_update_promises)
        console.log("<SUCCESS> (migrations/"
          + "change_quiz_answer_indices_to_2d_array)")
        res.json(updated_submissions)
      } catch(error) {
        console.log("<ERROR> (migrations/"
          + "change_quiz_answer_indices_to_2d_array)")
        next(error)
      }
    }
  })
  }
)

module.exports = migrationRoutes;