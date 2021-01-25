import moment from 'moment'
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
			let meeting_students = new Set()
			for(let i = 0; i < meeting.sections.length; i++) {
				const section_students = meeting.sections[i].students
				for(let j = 0; j < section_students.length; j++) {
					const student = section_students[j]
					meeting_students.add({
						first_name: student.first_name,
						last_name: student.last_name,
						user_id: student.user_id
					})
				}
			}
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
		}
	}
}