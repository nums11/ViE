import API from '@/services/API'

export default {
  changeCourseInstructorToArray() {
    return API().post('global_commands/'
      + 'change_course_instructor_to_array', {})
  },
  changeNotificationJobInstructorToArray() {
    return API().post('global_commands/'
      + 'change_notification_job_instructor_to_array', {})
  },
  addQuizzesToRealTimePortions() {
    return API().post('global_commands/'
      + 'add_quizzes_to_real_time_portions', {})
  },
  changeCorrectAnswerIndexToArray() {
    return API().post('global_commands/'
      + 'change_correct_answer_index_to_array', {})
  }
}
