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
		}
	}
}