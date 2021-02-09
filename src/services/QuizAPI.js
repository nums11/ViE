import API from '@/services/API'

export default {
	// GET ----------------
	getQuiz(quiz_id) {
		return API().get(`quizzes/get/${quiz_id}`)
	},
  // POST ---------------
  updateQuiz(quiz_id, quiz){
    return API().post(`quizzes/update/${quiz_id}`, {
      quiz: quiz
    })
  },
}
