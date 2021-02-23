const Quiz = require('../Quiz/Quiz.model');
const QuizQuestion = require('../QuizQuestion/QuizQuestion.model');
const RealTimePortion = require('../RealTimePortion/RealTimePortion.model');
const SubmissionHelper = require('../helpers/submission_helper.js');

module.exports = {createQuiz, deleteQuiz, getQuizQuestionIds}

async function createQuiz(quiz) {
  try {
    const saved_questions = await createQuizQuestions(quiz.questions)
    if(saved_questions == null)
      throw "<ERROR> createQuiz saving questions"
    const new_quiz = new Quiz({
      name: quiz.name,
      questions: saved_questions
    })
    const saved_quiz = await new_quiz.save()
    return saved_quiz
  } catch(error) {
    console.log("<ERROR> createQuiz quiz", quiz, error)
    return null
  }
}

async function createQuizQuestions(questions) {
  try {
    let question_promises = []
    questions.forEach(question => {
      question_promises.push(new Promise(
        async (resolve,reject) => {
        try {
          let answer_choices = []
          question.answer_choices.forEach(choice => {
            answer_choices.push(choice.text)
          })
          const new_question = new QuizQuestion({
            question: question.question,
            answer_choices: answer_choices,
            correct_answer_indices: question.correct_answer_indices,
            video_timestamp: question.video_timestamp
          })
          const saved_question = await new_question.save()
          resolve(saved_question)
        } catch(error) {
          console.log("<ERROR> createQuizQuestions saving question",
            question, error)
          reject(error)
        }
      }))
    })
    const saved_questions = await Promise.all(question_promises)
    return saved_questions
  } catch(error) {
    console.log("<ERROR> createQuizQuestions questions", questions)
    return null
  }
}

async function deleteQuiz(quiz_id, quiz_question_ids,
  submission_ids = null, real_time_portion_id = null) {
  try {
    const deletion_status = await deleteQuizQuestions(
      quiz_question_ids)
    if(deletion_status === false)
      throw "<ERROR> deleteQuiz deleting quiz questions"
    const quiz_deletion_promise = new Promise(
      (resolve, reject) => {
        Quiz.findByIdAndRemove(quiz_id,
          (error) => {
            if(error) {
              console.log(`<ERROR> deleteQuiz deleting quiz`
                + ` with id ${quiz_id}`, error)
              reject(error)
            } else {
              resolve(true)
            }
          }
        )  
      })
    await Promise.resolve(quiz_deletion_promise)
    if(submission_ids != null) {
      const submissions_deletion_status =
        await SubmissionHelper.deleteSubmissions(submission_ids)
      if(!submissions_deletion_status)
        throw "<ERROR> deleteQuiz deleting submissions"
    }
    if(real_time_portion_id != null) {
      const updated_real_time_portion = await
        removeQuizFromRealTimePortion(quiz_id, real_time_portion_id)
      if(updated_real_time_portion == null)
        throw "<ERROR> deleteQuiz removing quiz from real time portion"
    }
    return true
  } catch(error) {real_time_portion_id
    console.log(`<ERROR> deleteQuiz quiz_id quiz_id ${quiz_id}`
      + ` quiz_question_ids`, quiz_question_ids, error)
    return false
  }
}

async function deleteQuizQuestions(quiz_question_ids) {
  try {
    let question_deletion_promises = []
    quiz_question_ids.forEach(question_id => {
      question_deletion_promises.push(new Promise(
        (resolve, reject) => {
          QuizQuestion.findByIdAndRemove(question_id,
            (error) => {
              if(error) {
                console.log(`<ERROR> deleteQuizQuestions deleting`
                  + ` quiz question with id ${question_id}`, error)
                reject(error)
              } else {
                resolve(true)
              }
            }
          )
        })
      )
    })
    const deletion_statuses = await Promise.all(
      question_deletion_promises)
    return true
  } catch(error) {
    console.log("<ERROR> deleteQuizQuestions quiz_question_ids",
      quiz_question_ids)
    return false
  }
}

function getQuizQuestionIds(quiz) {
  const ids = []
  quiz.questions.forEach(question => {
    ids.push(question)
  })
  return ids
}

async function removeQuizFromRealTimePortion(quiz_id,
  real_time_portion_id) {
  try {
    const real_time_portion_promise = new Promise((resolve, reject) => {
      RealTimePortion.findByIdAndUpdate(real_time_portion_id,
        {$pull: {quizzes: quiz_id}},
        (error, real_time_portion) => {
          if(error) {
            console.log(`<ERROR> removeQuizFromRealTimePortion updating`
              + ` real_time_portion with id ${real_time_portion_id} and`
              + ` quiz_id ${quiz_id}`, error)
            reject(error)
          } else if(real_time_portion == null) {
            console.log(`<ERROR> removeQuizFromRealTimePortion`
              + ` real_time_portion with id ${real_time_portion_id} not found`)
            reject(null)
          } else {
            resolve(real_time_portion)
          }
        }
      )
    })
    const updated_real_time_portion = 
      await Promise.resolve(real_time_portion_promise)
    return updated_real_time_portion
  } catch(error) {
    console.log(`<ERROR> removeQuizFromRealTimePortion`
      + ` quiz_id ${quiz_id} real_time_portion_id `
      + `${real_time_portion_id}`, error)
    return null
  }
}