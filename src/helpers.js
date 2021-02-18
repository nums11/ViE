import moment from 'moment'
import momentDurationFormatSetup from "moment-duration-format"
momentDurationFormatSetup(moment)
import UserAPI from '@/services/UserAPI';

export default {
	data() {
		return {
			user_courses: []
		}
	},
	methods: {
		assignUserCourses() {
		  if(this.is_instructor)
		    this.user_courses = this.user.instructor_courses
		  else {
		    this.user.student_sections.forEach(section => {
		      this.user_courses.push(section.course)
		    })
		  }
		},
		getRealTimePortionStatus(real_time_portion) {
		  const current_time = new Date()
		  if(moment(current_time).isBefore(real_time_portion.real_time_start))
		    return "pending"
		  else if(moment(current_time).isAfter(real_time_portion.real_time_end))
		    return "closed"
		  else
		    return "open"
		},
		studentSubmittedToQRScan(student_user_id, qr_scan) {
		  const submissions = qr_scan.submissions
		  let student_has_submitted = false
		  for(let i = 0; i < submissions.length; i++) {
		    if(submissions[i].submitter.user_id === student_user_id){
		      student_has_submitted = true
		      break
		    }
		  }
		  return student_has_submitted
		},
		getMeetingStudentIDs(meeting) {
			let meeting_student_ids = new Set()
			for(let i = 0; i < meeting.sections.length; i++) {
				const section_students = meeting.sections[i].students
				for(let j = 0; j < section_students.length; j++) {
					meeting_student_ids.add(section_students[j].user_id)
				}
			}
			return meeting_student_ids
		},
		getMeetingStudents(meeting) {
			let meeting_students_arr = []
			for(let i = 0; i < meeting.sections.length; i++) {
				const section_students = meeting.sections[i].students
				for(let j = 0; j < section_students.length; j++) {
					const student = section_students[j]
					meeting_students_arr.push({
						first_name: student.first_name,
						last_name: student.last_name,
						user_id: student.user_id,
						_id: student._id
					})
				}
			}
			meeting_students_arr.sort(this.userCompare)
			let meeting_students = new Set(meeting_students_arr)
			return meeting_students
		},
		getBaseURL() {
			if(process.env.NODE_ENV === "production") {
			  return "https://viengage.com/"
			} else {
			  return "http://localhost:4000/"
			}
		},
		sectionCompare(a,b) {
			if ( a.section_number < b.section_number ){
			  return -1;
			}
			if ( a.section_number > b.section_number ){
			  return 1;
			}
			return 0;
		},
		userCompare(a, b) {
			if ( a.user_id < b.user_id ){
			  return -1;
			}
			if ( a.user_id > b.user_id ){
			  return 1;
			}
			return 0;
		},
		getDeepCopy(obj) {
			return JSON.parse(JSON.stringify(obj))
		},
		async registerServiceWorkerAndAddSubscription() {
		 // Register service worker
		 let register = await navigator.serviceWorker.register("worker.js", {
		   scope: "/"
		 });
		 // Wait until worker is ready
		 register = await navigator.serviceWorker.ready
		 // Register Push
		 const publicVapidKey =
		   "BG5zFCphvwcm3WYs3N5d41jO85PcvpJkEYPlz9j3OjVdzI_XX0KPw_U8V5aEmaOBHXIymaGcCWyOAH-TmoobXKA"
		 const subscription = await register.pushManager.subscribe({
		   userVisibleOnly: true,
		   applicationServerKey: this.urlBase64ToUint8Array(publicVapidKey)
		 });
		 const response = await UserAPI.addServiceWorkerSubscriptionForUser(
		   this.state_user._id,subscription)
		 console.log("Added subscription to user", response.data)
		},
		urlBase64ToUint8Array(base64String) {
		  const padding = "=".repeat((4 - base64String.length % 4) % 4);
		  const base64 = (base64String + padding)
		    .replace(/\-/g, "+")
		    .replace(/_/g, "/");
		  const rawData = window.atob(base64);
		  const outputArray = new Uint8Array(rawData.length);
		  for (let i = 0; i < rawData.length; ++i) {
		    outputArray[i] = rawData.charCodeAt(i);
		  }
		  return outputArray;
		},
		checkIfStudentSubmittedToTask(task) {
		  const submissions = task.submissions
		  let submission = null
		  for(let i = 0; i < submissions.length; i++) {
		    const submitter = submissions[i].submitter
		    if(submitter.user_id === this.state_user.user_id) {
		    	submission = submissions[i]
		      break
		    }
		  }
		  return submission
		},
		getFormattedVideoTimestamp(timestamp) {
			let format_string;
			// 1 hour
			if(timestamp > 3600)
			  format_string = "h:m:ss"
			else
			  format_string = "m:ss"
			const formatted_timestamp = moment.duration(
			  timestamp, "seconds").format(format_string, {trim: false})
			return formatted_timestamp
		},
		getPresentAndAbsentStudents(meeting_students, task) {
			let absent_students = [], present_students = [],
			num_table_rows = 0
		  meeting_students.forEach(student => {
		    let student_submission = null
		    for(let i = 0; i < task.submissions.length;
		      i++) {
		      const submission = task.submissions[i]
		      if(submission.submitter.user_id === student.user_id){
		        student_submission = {
		          first_name: student.first_name,
		          last_name: student.last_name,
		          user_id: student.user_id,
		          quiz_answer_indices: submission.quiz_answer_indices,
		          num_correct_answers: submission.num_correct_answers,
		          video_percent_watched: submission.video_percent_watched,
		          _id: student._id
		        }
		        break
		      }
		    }
		    if(student_submission == null)
		     	absent_students.push(student)
		    else
		      present_students.push(student_submission)
		  })
		  if(absent_students.length > present_students.length)
		    num_table_rows = absent_students.length
		  else
		    num_table_rows = present_students.length
		  return {
		  	present_students: present_students,
		  	absent_students: absent_students,
		  	num_table_rows: num_table_rows
		  }
		},
		listenForArrowKeyPress() {
		  window.addEventListener('keydown', this.handleKeyPress)
		},
		handleKeyPress (e) {
		  if(e.keyCode === 37)
		   this.moveVideo5Seconds(false)
		  else if(e.keyCode === 39)
		   this.moveVideo5Seconds(true)
		},
		moveVideo5Seconds(forward) {
		  let current_time = this.player.currentTime()
		  if(forward) {
		    current_time += 5
		    const duration = this.player.duration()
		    if(current_time > duration)
		      current_time = duration
		  } else {
		    current_time -= 5
		    if(current_time < 0)
		      current_time = 0
		  }
		  this.player.currentTime(current_time)
		},
		getObjectIdsFromObjects(objects) {
			const object_ids = []
			objects.forEach(object => {
				object_ids.push(object._id)
			})
			return object_ids
		},
		getStudentIDsAndMeetingIDS(section) {
		  let meeting_ids = []
		  let student_ids = []
		  let pending_approval_student_ids = []
		  section.meetings.forEach(meeting => {
		    meeting_ids.push(meeting._id)
		  })
		  section.students.forEach(student => {
		    student_ids.push(student._id)
		  })
		  section.pending_approval_students.forEach(student => {
		    pending_approval_student_ids.push(student._id)
		  })
		  return [meeting_ids, student_ids, pending_approval_student_ids]
		},
		getCourseSectionsAndMeetingIDs(course) {
		  let sections = []
		  let course_meeting_ids = []
		  course.sections.forEach(section => {
		    const [meeting_ids, student_ids,
		    pending_approval_student_ids]
		      = this.getStudentIDsAndMeetingIDS(section)
		    course_meeting_ids = course_meeting_ids.concat(meeting_ids)
		    sections.push({
		      student_ids: student_ids,
		      pending_approval_student_ids: pending_approval_student_ids,
		      meeting_ids: meeting_ids
		    })
		  })
		  const unique_meeting_ids = [...new Set(course_meeting_ids)]
		  return [sections, unique_meeting_ids]
		},
		userAnsweredQuestion(submission, current_question_index) {
			return submission.quiz_answer_indices.length >
          		current_question_index
		},
		meetingIsRealTime(meeting, now) {
		  if(meeting.real_time_portion == null)
		    return false
		  return moment(now).isBetween(meeting.real_time_portion.real_time_start,
		    meeting.real_time_portion.real_time_end)
		},
		userAnsweredRealTimeQuestion(submission, current_question_index) {
		  return submission.quiz_answer_indices[
		    current_question_index] !== -1
		},
		calculateTaskAverage(type, task, present_students) {
			let is_video_percent;
		  if(type === "video_percent")
		    is_video_percent = true
		  const num_present_students = present_students.length
		  if(num_present_students > 0) {
		    let total = 0
		    present_students.forEach(student => {
		      total += is_video_percent ?
		      student.video_percent_watched :
		      (student.num_correct_answers / task.questions.length)
		    })
		    const average = total / num_present_students
		    if(is_video_percent)
		      return average
		    else
		      return average*100 
		  }
		},
		calculateMeetingPercentages(meeting, meeting_students) {
			const meeting_percentages = {
				overall_percent: 0,
				real_time_percent: 0,
				async_percent: 0,
				average_qr_scan_submission_percent: 0,
				average_quiz_submission_percent: 0,
				average_video_submission_perent: 0,
				average_quiz_score: 0,
				average_video_viewing_percent: 0,
				average_video_quiz_score: 0,
				submitter_user_ids: new Set()
			}

		  if(meeting_students.size === 0)
		    return meeting_percentages

		  const num_students = meeting_students.size
		  let submitter_user_ids = new Set()

		  if(meeting.real_time_portion != null) {
		  	// QR Scan Stats
		    const qr_scans = meeting.real_time_portion.qr_scans
		    const qr_percentages_with_ids =
		      this.getSubmitterUserIDsAndSubmissionPercentagesForTasks(
		      	qr_scans, meeting_students)
	     	meeting_percentages.average_qr_scan_submission_percent
		     	= qr_percentages_with_ids.average_submission_percentage_for_tasks
		    const submitter_user_ids_for_qr_scans =
		    	qr_percentages_with_ids.submitter_user_ids_for_tasks

		    // Quiz Stats
		    const quizzes = meeting.real_time_portion.quizzes
		    const quiz_percentages_with_ids =
		      this.getSubmitterUserIDsAndSubmissionPercentagesForTasks(
		      	quizzes, meeting_students)
	      meeting_percentages.average_quiz_submission_percent
	      	= quiz_percentages_with_ids.average_submission_percentage_for_tasks
	      const submitter_user_ids_for_quizzes =
	      	quiz_percentages_with_ids.submitter_user_ids_for_tasks
	      meeting_percentages.average_quiz_score =
	      	this.getAverageQuizScoreForQuizzes(quizzes, meeting_students)

		    submitter_user_ids = new Set([...submitter_user_ids_for_qr_scans,
		      ...submitter_user_ids_for_quizzes])
		    meeting_percentages.real_time_percent =
		      (submitter_user_ids.size / num_students) * 100
		  }

		  if(meeting.async_portion != null) {
		  	// Video Stats
		    const videos = meeting.async_portion.videos
		    const video_percentages_with_ids =
		      this.getSubmitterUserIDsAndSubmissionPercentagesForTasks(
		      	videos, meeting_students)
		    meeting_percentages.average_video_submission_perent
		    	= video_percentages_with_ids.average_submission_percentage_for_tasks
		    const submitter_user_ids_for_videos =
		    	video_percentages_with_ids.submitter_user_ids_for_tasks
		    const video_stats =
		    	this.getAverageViewingPercentageAndQuizScoreForVideos(
		    		videos, meeting_students)
		    meeting_percentages.average_video_viewing_percent =
		    	video_stats.average_video_viewing_percent
		    meeting_percentages.average_video_quiz_score =
		    	video_stats.average_video_quiz_score

		    submitter_user_ids = new Set([...submitter_user_ids,
		      ...submitter_user_ids_for_videos])
		    meeting_percentages.async_percent =
		      (submitter_user_ids_for_videos.size / num_students) * 100
		  }

		  meeting_percentages.overall_percent =
		    (submitter_user_ids.size / num_students) * 100
	   	meeting_percentages.submitter_user_ids = submitter_user_ids
		  return meeting_percentages
		},
		getSubmitterUserIDsAndSubmissionPercentagesForTasks(
			tasks, meeting_students) {
			const tasks_percentages_with_ids = {
				average_submission_percentage_for_tasks: 0,
				submitter_user_ids_for_tasks: new Set()
			}
			if(tasks.length === 0)
				return tasks_percentages_with_ids

		  const submitter_user_ids_for_tasks = new Set()
		  let submission_percentage_total = 0
		  tasks.forEach(task => {
		    let students = this.getPresentAndAbsentStudents(
		      meeting_students, task)
		    let present_students = students.present_students
		      this.addStudentUserIDsToSet(
		      	submitter_user_ids_for_tasks, present_students)
	     	let submission_percentage =
	     		present_students.length / meeting_students.size
	     	submission_percentage_total += submission_percentage
		  })
		  tasks_percentages_with_ids.average_submission_percentage_for_tasks
		  	= submission_percentage_total / tasks.length
		  tasks_percentages_with_ids.submitter_user_ids_for_tasks
		  	= submitter_user_ids_for_tasks
		  return tasks_percentages_with_ids
		},
		addStudentUserIDsToSet(set, students) {
		  students.forEach(student => {
		    set.add(student.user_id)
		  })
		},
		getAverageQuizScoreForQuizzes(quizzes, meeting_students) {
			if(quizzes.length === 0)
				return 0

			let total_score_for_all_quizzes = 0
			let num_quizzes_with_submissions = 0
			quizzes.forEach(quiz => {
				const students = this.getPresentAndAbsentStudents(
					meeting_students, quiz)
				const present_students = students.present_students
				if(present_students.length > 0) {
					num_quizzes_with_submissions++
					let avg_quiz_score = this.calculateTaskAverage(
						'quiz_score', quiz, present_students)
					total_score_for_all_quizzes += avg_quiz_score
				}
			})
			if(num_quizzes_with_submissions > 0)
				return total_score_for_all_quizzes / num_quizzes_with_submissions
			else
				return 0
		},
		getAverageViewingPercentageAndQuizScoreForVideos(
			videos, meeting_students) {
			const video_stats = {
				average_video_viewing_percent: 0,
				average_video_quiz_score: 0
			}

			if(videos.length === 0)
				return video_stats

			let total_viewing_percentage_for_videos = 0
			let total_quiz_score_for_videos = 0
			let num_videos_with_submissions = 0
			videos.forEach(video => {
				const students = this.getPresentAndAbsentStudents(
					meeting_students, video)
				const present_students = students.present_students
				if(present_students.length > 0) {
					num_videos_with_submissions++
					let avg_viewing_percentage = this.calculateTaskAverage(
						'video_percent', video, present_students)
					total_viewing_percentage_for_videos += avg_viewing_percentage
					if(video.quiz != null) {
						let avg_video_quiz_score = this.calculateTaskAverage(
						'quiz_score', video.quiz, present_students)
						total_quiz_score_for_videos += avg_video_quiz_score
					}
				}
			})
			if(num_videos_with_submissions > 0) {
				video_stats.average_video_viewing_percent =
					(total_viewing_percentage_for_videos /
						num_videos_with_submissions)
				video_stats.average_video_quiz_score =
					(total_quiz_score_for_videos /
						num_videos_with_submissions)
				return video_stats
			} else
				return video_stats
		},
		meetingHasTaskType(meeting, task_type) {
		  if(task_type === 'qr_scan') {
		    if(meeting.real_time_portion == null)
		      return false
		    return meeting.real_time_portion.qr_scans.length > 0
		  } else if(task_type === 'quiz') {
		    if(meeting.real_time_portion == null)
		      return false
		    return meeting.real_time_portion.quizzes.length > 0
		  } else if(task_type === 'video') {
		    if(meeting.async_portion == null)
		      return false
		    return meeting.async_portion.videos.length > 0
		  } else if(task_type === 'video_quiz') {
		    if(meeting.async_portion == null)
		      return false
		    const videos = meeting.async_portion.videos
		    let video_has_quiz = false
		    for(let i = 0; i < videos.length; i++) {
		      if(videos[i].quiz != null) {
		        video_has_quiz = true
		        break
		      }
		    }
		    return video_has_quiz
		  }
		}
	}
}