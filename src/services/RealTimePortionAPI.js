import API from '@/services/API'

export default {
  addQRScan(real_time_portion_id, qr_scan, meeting_id,
    instructor_ids) {
    return API().post(
    	`real_time_portions/add_qr_scan/${real_time_portion_id}`, {
    		qr_scan: qr_scan,
        meeting_id: meeting_id,
        instructor_ids: instructor_ids
    	})
  },
  addQuiz(real_time_portion_id, quiz) {
    return API().post(
      `real_time_portions/add_quiz/${real_time_portion_id}`, {
        quiz: quiz
      })
  },
  deleteRealTimePortion(real_time_portion_id, meeting_id,
  	qr_scans, quizzes) {
  	return API().delete(
  		`real_time_portions/delete/${real_time_portion_id}`, {
  			data: {
  				meeting_id: meeting_id,
  				qr_scans: qr_scans,
          quizzes: quizzes
  			}
  		})
  }
}
