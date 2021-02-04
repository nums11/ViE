import API from '@/services/API'

export default {
  // POST ---------------
  updateQuiz(quiz_id, quiz){
    return API().post(`quizzes/update/${quiz_id}`, {
      quiz: quiz
    })
  },
}
