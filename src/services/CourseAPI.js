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
  addSecondaryInstructor(course_id, instructor_id) {
    return API().post('courses/add_secondary_instructor/' + course_id
      + '/' + instructor_id, 
    {})
  },
  removeSecondaryInstructor(course_id, instructor_id) {
    return API().post('courses/remove_secondary_instructor/' + course_id
      + '/' + instructor_id)
  },
  addSectionToCourse(course_id, section_number) {
    return API().post('courses/add_section/' + course_id, {
      section_number: section_number
    })
  },
  addStudentToCourse(course_id, student_id) {
    return API().post('courses/add_student/' + course_id + '/' + student_id, {})
  },
  removeStudentFromCourse(course_id, student_id) {
    return API().post('courses/remove_student/' + course_id + '/' + student_id, {})
  },
  getCourse(id) {
    return API().get(`courses/get/${id}/false`)
  },
  getCourseWithMeetings(id) {
    return API().get(`courses/get/${id}/true`)
  },
  updateCourse(course_id, new_course){
    return API().post(`courses/update/${course_id}`, {
      new_course: new_course
    })
  },
  inviteStudentsCAS (course_id, users) {
    return API().post(`courses/cas_invite_student/${course_id}`, {
      users
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
