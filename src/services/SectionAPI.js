import API from '@/services/API'

export default {
  // GET --------------
  getSections() {
    return API().get('sections')
  },
  getSectionByJoinCode(join_code) {
    return API().get(`sections/by_join_code/${join_code}`)
  },
  // POST --------------
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
      `sections/handle_student/${section_id}/${student_id}/approve_student`,
      {})
  },
  denyStudentApprovalIntoSection(section_id, student_id) {
    return API().post(
      `sections/handle_student/${section_id}/${student_id}/deny_student`,
      {})
  },
  // DELETE --------------
  deleteSection(section_id, meeting_ids, student_ids,
    pending_approval_student_ids, instructor_id, course_id) {
    return API().delete(`sections/delete/${section_id}`, {
      data: {
        meeting_ids: meeting_ids,
        student_ids: student_ids,
        pending_approval_student_ids: pending_approval_student_ids,
        instructor_id: instructor_id,
        course_id: course_id
      }
    })
  },
}
