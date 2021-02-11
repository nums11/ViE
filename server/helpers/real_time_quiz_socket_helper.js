
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

}