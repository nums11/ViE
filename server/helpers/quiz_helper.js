const Quiz = require('../Quiz/Quiz.model');
const QuizQuestion = require('../QuizQuestion/QuizQuestion.model');

module.exports = {createQuiz}

async function createQuiz(quiz) {
  try {
    const saved_questions = await createQuizQuestions(quiz.questions)
    if(saved_questions == null)
      throw "<ERROR> createQuiz saving questions"
    const new_quiz = new Quiz({
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
            correct_answer_index: question.correct_answer_index,
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