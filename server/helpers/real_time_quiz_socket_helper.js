const SubmissionHelper = require('./submission_helper')

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

	socket.on('leaveRealTimeQuiz', (quiz_id) => {
		console.log(`received leaveRealTimeQuiz event for `
		+ `quiz_id ${quiz_id}`)
		const quiz = real_time_quiz_ids.get(quiz_id)
		if(quiz == null) {
			return
		}

		const index = quiz.student_socket_ids.indexOf(socket.id)
		quiz.student_socket_ids.splice(index,1)
	})

	socket.on('addStudentQuizSubmission',
		async (student_object_id, quiz_id,
			num_quiz_questions, current_question_index,
			selected_choice_index, is_correct,
			existing_submission, cb) => {
	  console.log(`received addStudentQuizSubmission event for `
	  + `quiz_id ${quiz_id}`)
	  const quiz = real_time_quiz_ids.get(quiz_id)
	  if(quiz == null) {
	  	cb(null)
	  	return
	  }

	  let submission;
	  let updated_submission;
	  if(existing_submission != null) {
	  	submission = existing_submission
	  	updated_submission = await SubmissionHelper.updateSubmission(
	  	  submission._id, submission)
	  } else {
	  	const num_correct_answers = is_correct ? 1 : 0
	  	submission = {
	  	  submitter: student_object_id,
	  	  task_type: "Quiz",
	  	  num_correct_answers: num_correct_answers 
	  	}
	  	submission.quiz_answer_indices =
	  		new Array(num_quiz_questions).fill(-1)
	  	submission.quiz_answer_indices[current_question_index] = selected_choice_index
	  	updated_submission = await SubmissionHelper.addQuizSubmission(
	  	  quiz_id, submission)
	  }
  	if(updated_submission == null) {
  		cb(null)
  		return
  	}

	  io.to(quiz.instructor_socket_id).emit(
	  	'addStudentSubmission',selected_choice_index,updated_submission)
	  cb(updated_submission)
	})

	socket.on('changeQuestion', (quiz_id, question_id, cb) => {
		console.log(`received changeQuestion event for `
		+ `quiz_id ${quiz_id}`)
		const quiz = real_time_quiz_ids.get(quiz_id)
		if(quiz == null) {
			cb(false)
			return
		}
		quiz.current_question_id = question_id
		real_time_quiz_ids.set(quiz_id, quiz)
		quiz.student_socket_ids.forEach(socket_id => {
			io.to(socket_id).emit('changeQuestion', question_id)
		})
		cb(true)
	})

	socket.on('endRealTimeQuiz', (quiz_id, cb) => {
		console.log(`received endRealTimeQuiz event for `
		+ `quiz_id ${quiz_id}`)
		const quiz = real_time_quiz_ids.get(quiz_id)
		if(quiz == null) {
			cb(false)
			return
		}

		quiz.student_socket_ids.forEach(socket_id => {
			io.to(socket_id).emit('endRealTimeQuiz')
		})
		real_time_quiz_ids.delete(quiz_id)
		cb(true)
	})

}