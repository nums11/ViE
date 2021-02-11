const express = require('express');
const quizRoutes = express.Router();
const Quiz = require('../Quiz/Quiz.model');
const QuizQuestion = require('../QuizQuestion/QuizQuestion.model');

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

module.exports = quizRoutes;
