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
  // DELETE -------------
  deleteQuiz(quiz_id, quiz_question_ids,
    real_time_portion_id, submission_ids) {
    return API().delete(`quizzes/delete/${quiz_id}`, {
      data: {
        quiz_question_ids: quiz_question_ids,
        real_time_portion_id: real_time_portion_id,
        submission_ids: submission_ids
      }
    })
  }
}
