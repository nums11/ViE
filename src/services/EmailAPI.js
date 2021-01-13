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
}
