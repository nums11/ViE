import API from '@/services/API'

export default {
  // GET ---------------
  getCourses() {
    return API().get('courses/all')
  },
  getCourse(id) {
    return API().get(`courses/get/${id}`)
  },
  getCourseWithMeetings(id) {
    return API().get(`courses/get/${id}/true`)
  },
  // POST ---------------
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
  updateCourse(course_id, course){
    return API().post(`courses/update/${course_id}`, {
      course: course
    })
  },
  addInstructor(course_id, instructor_user_id, is_rpi_member,
    meeting_ids) {
    return API().post(`courses/add_instructor/${course_id}`, {
      instructor_user_id: instructor_user_id,
      is_rpi_member: is_rpi_member,
      meeting_ids: meeting_ids
    })
  },
  // DELETE ---------------
  deleteCourse(course_id, sections, meeting_ids, instructor_id) {
    return API().delete(`courses/delete/${course_id}`, {
      data: {
        sections: sections,
        meeting_ids: meeting_ids,
        instructor_id: instructor_id
      }
    })
  },
}
