import moment from 'moment'

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
		getBaseURL() {
			if(process.env.NODE_ENV === "production") {
			  return "https://viengage.herokuapp.com/"
			} else {
			  return "http://localhost:4000/"
			}
		}
	}
}