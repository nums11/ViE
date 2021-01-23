import API from '@/services/API'

export default {
  sendInviteEmails(course_name, course_subject_code,
    course_number, section_number, instructor_name,
    join_code, student_emails) {
    return API().post('emails/invite', {
      course_name: course_name,
      course_subject_code: course_subject_code,
      course_number: course_number,
      section_number: section_number,
      instructor_name: instructor_name,
      join_code: join_code,
      student_emails: student_emails
    })
  },
  sendPasswordResetEmail(email, user_id) {
    return API().post('emails/reset_password', {
      email: email,
      user_id: user_id
    })
  },
  sendNewStudentEmailToInstructor(instructor_email,
    student_name, course_name, course_subject_code,
    course_number, section_number, open_enrollment) {
    return API().post('emails/new_student', {
      instructor_email: instructor_email,
      student_name: student_name,
      course_name: course_name,
      course_subject_code: course_subject_code,
      course_number: course_number,
      section_number: section_number,
      open_enrollment: open_enrollment
    })
  },
  sendApproveOrDenyEmailToStudent(student_email,
    instructor_name, course_name, course_subject_code,
    course_number, section_number, is_approval) {
    return API().post('emails/approve_or_deny', {
      student_email: student_email,
      instructor_name: instructor_name,
      course_name: course_name,
      course_subject_code: course_subject_code,
      course_number: course_number,
      section_number: section_number,
      is_approval: is_approval
    })
  }
}
