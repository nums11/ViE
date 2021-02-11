
module.exports = {handleRealTimeQuizSocketEvents}

function handleRealTimeQuizSocketEvents(io, socket,
	real_time_quiz_ids) {
	socket.on('startRealTimeQuiz',
		(quiz_id,current_question_id) => {
	  console.log(`Starting real-time quiz for quiz id `
	  	+ `${quiz_id}`)
	  real_time_quiz_ids.set(quiz_id, {
	  	instructor_socket_id: socket.id,
	  	current_question_id: current_question_id,
	  	student_socket_ids: []
	  })
	})

	socket.on('joinRealTimeQuiz', (quiz_id, cb) => {
	  console.log(`received joinRealTimeQuiz event for `
	  + `quiz_id ${quiz_id}`)
	  const quiz = real_time_quiz_ids.get(quiz_id)
	  if(quiz == null)
	  	cb(false, null)
	  else {
	  	quiz.student_socket_ids.push(socket.id)
	  	cb(true, quiz.current_question_id)
	  }
	})

}