import API from '@/services/API'

export default {
  getCourses() {
    return API().get('courses')
  },
  addCourse(course) {
    return API().post('courses/add', {
      course: course
    })
  },
  addSectionToCourse(course_id, section) {
    return API().post('courses/add_section/' + course_id, {
      section: section
    })
  },
  addStudentToCourse(course_id, student_id) {
    return API().post('courses/add_student/' + course_id + '/' + student_id, {})
  },
  removeStudentFromCourse(course_id, student_id) {
    return API().post('courses/remove_student/' + course_id + '/' + student_id, {})
  },
  getCourse(id) {
    return API().get('courses/get/' + id)
  },
  updateCourse(id, course){
    return API().post('courses/update/' + id, {
      updated_course: course
    })
  },
  deleteCourse (id) {
    return API().delete('courses/delete/' + id)
  },
  getInstructor (course_id) {
    return API().get('courses/getInstructor/' + course_id)
  },
  getInstructorCourses (user_id) {
    return API().get('courses/get_instructor_courses/' + user_id)
  },
}
