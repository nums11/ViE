import API from '@/services/API'

export default {
  getSections() {
    return API().get('sections')
  },
  addSection(section) {
    return API().post('sections/add', {
      section: section // add our data to the request body
    })
  },
  addStudentToSection(section_id, student_id, has_open_enrollment) {
    const operation = has_open_enrollment ?
    "add_student" : "add_pending_approval_student"
    return API().post(`sections/handle_student/${section_id}/${student_id}` +
      `/${operation}`, {})
  },
  removeStudentFromSection(section_id, student_id) {
    return API().post(`sections/handle_student/${section_id}/${student_id}` +
      `/remove_student`, {})
  },
  approveStudentIntoSection(section_id, student_id) {
    return API().post(
      `sections/handle_enrollment/${section_id}/${student_id}/approve_student`,
      {})
  },
  denyStudentApprovalIntoSection(section_id, student_id) {
    return API().post(
      `sections/handle_enrollment/${section_id}/${student_id}/deny_student`,
      {})
  },
  getSection(id) {
    return API().get('sections/get/' + id)
  },
  updateSection(section_id, new_section) {
    return API().post(`sections/update/${section_id}`, {
      new_section: new_section
    })
  },
  updateSectionNumber(section_id, section_number){
    return API().post(`sections/update_section_number/${section_id}`, {
      updated_section_number: section_number
    })
  },
  deleteSection(id) {
    return API().delete('sections/delete/' + id)
  },
  getInstructor (section_id) {
    return API().get('sections/getInstructor/' + section_id)
  },
  getCourse (section_id) {
    return API().get('sections/getCourse/' + section_id)
  },
  getStudents (section_id) {
    return API().get('sections/getStudents/' + section_id)
  },  
  getSectionsWithCoursesForStudent(user_id) {
    return API().get('sections/get_with_courses_for_student/' + user_id)
  },
  getSectionWithCourse(section_id) {
    return API().get('sections/get_with_course/' + section_id)
  },
  getSectionsForCourse(course_id) {
    return API().get('sections/get_for_course/' + course_id)
  },
  getSectionByJoinCode(join_code) {
    return API().get(`sections/by_join_code/${join_code}`)
  },
  inviteStudentToSection(section_id, student_id,
    course_name, instructor_name) {
    return API().post(`sections/invite_student/${section_id}/${student_id}`,
    {
      course_name: course_name,
      instructor_name: instructor_name
    })
  },
  cancelInvite(section_id, student_user_id, invite_code) {
    return API().post(`sections/cancel_invite/${section_id}/`
      + `${student_user_id}/${invite_code}`, {})
  }
}
