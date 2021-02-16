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
	}
}