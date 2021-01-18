import API from '@/services/API'

export default {
  getCourses() {
    return API().get('courses')
  },
  addCourse(course, sections) {
    return API().post('courses/add', {
      course: course,
      sections: sections
    })
  },
  addSectionToCourse(course_id, section) {
    return API().post('courses/add_section/' + course_id, {
      section: section
    })
  },
  getCourse(id) {
    return API().get(`courses/get/${id}`)
  },
  getCourseWithMeetings(id) {
    return API().get(`courses/get/${id}/true`)
  },
  updateCourse(course_id, course){
    return API().post(`courses/update/${course_id}`, {
      course: course
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
