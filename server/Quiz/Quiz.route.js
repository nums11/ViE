const express = require('express');
const quizRoutes = express.Router();
const Quiz = require('../Quiz/Quiz.model');
const QuizQuestion = require('../QuizQuestion/QuizQuestion.model');
const QuizHelper = require('../helpers/quiz_helper.js');
const SubmissionHelper = require('../helpers/submission_helper.js');

// GET ---------------------

quizRoutes.get('/get/:quiz_id', function (req, res, next) {
  const quiz_id = req.params.quiz_id
  const quiz = req.body.quiz
  Quiz.findById(quiz_id).
  populate('questions').
  populate({
    path: 'submissions',
    populate: {
      path: 'submitter'
    }
  }).
  exec((error, quiz) => {
    if(error) {
      console.log(`<ERROR> (quizzes/get) getting quiz by`
        + ` id ${quiz_id}`, error)
      next(error)
    } else if(quiz == null) {
      console.log(`<ERROR> (quizzes/get) quiz with id ${quiz_id}`
        + ` not found`)
      res.status(404).json("Quiz not found")
    } else {
      console.log("<SUCCESS> (quizzes/get)")
      res.json(quiz)
    }
  })
});

// POST ---------------------

quizRoutes.post('/update/:quiz_id',
  async function (req, res, next) {
  const quiz_id = req.params.quiz_id
  const quiz = req.body.quiz

  try {
    let question_update_promises = []
    quiz.questions.forEach(question => {
      question_update_promises.push(new Promise(
        (resolve, reject) => {
          QuizQuestion.findByIdAndUpdate(question._id,
            {
              question: question.question,
              answer_choices: question.answer_choices
            },
            {new: true},
            (error, updated_question) => {
              if(error) {
                console.log(`<ERROR> (quizzes/update) updating quiz`
                  ` question with id ${question._id} and quiz`, quiz,
                  error)
                reject(error)
              } else if(updated_question == null) {
                console.log(`<ERROR> (quizzes/update) could not find`
                  + ` quiz question with id ${question._id}`)
                reject(null)
              } else {
                resolve(updated_question)
              }
            }
          )
        })
      )
    })
    const updated_questions = await Promise.all(
      question_update_promises)
    quiz.questions = updated_questions
    console.log("<SUCCESS> (quizzes/update)")
    res.json(quiz)
  } catch(error) {
    console.log(`<ERROR> (quizzes/update) quiz_id ${quiz_id}`
      + ` quiz`, quiz, error)
    next(error)
  }
});

// DELETE -------------------

quizRoutes.delete('/delete/:quiz_id',
  async function (req, res, next) {
  const quiz_id = req.params.quiz_id
  const quiz_question_ids = req.body.quiz_question_ids
  const real_time_portion_id = req.body.real_time_portion_id
  const submission_ids = req.body.submission_ids

  try {
    const quiz_promise = QuizHelper.deleteQuiz(
      quiz_id, quiz_question_ids, real_time_portion_id)
    const submission_promise = SubmissionHelper.deleteSubmissions(
      submission_ids)
    const deletion_statuses = await Promise.all([quiz_promise,
      submission_promise])
    if(!deletion_statuses[0])
      throw "<ERROR> (quizzes/delete) deleting quiz"
    if(!deletion_statuses[1])
      throw "<ERROR> (quizzes/delete) deleting submissions"
    console.log("<SUCCESS> (quizzes/delete)")
    res.json(true)
  } catch(error) {
    console.log(`<ERROR> (quizzes/delete) quiz_id ${quiz_id}`
      + ` quiz_question_ids ${quiz_question_ids} real_time_portion_id`
      + ` ${real_time_portion_id} submission_ids ${submission_ids}`)
    next(error)
  }
});

module.exports = quizRoutes;
