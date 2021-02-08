import API from './API'

export default {
  // GET -------------------
  getUsers() {
    return API().get('users/all')
  },
  getUserWithMeetings(id) {
    return API().get(`users/get/${id}/true`)
  },
  getUser(id) {
    return API().get(`users/get/${id}`)
  },
  getInstructorUserIds() {
    return API().get(`users/instructor_user_ids`)
  },
  getInstructors() {
    return API().get('users/instructors')
  },
  getStudents() {
    return API().get('users/students')
  },
  getInstructorCourses(id) {
    return API().get('users/instructor_courses/' + id)
  },
  getStudentSections(id) {
    return API().get('users/student_sections/' + id)
  },
  getStudentsForCourse(course_id) {
    return API().get('users/students_for_course/' + course_id)
  },
  // POST --------------------
  signUp(user) {
    return API().post('users/signup', {
      user: user // add our data to the request body
    })
  },
  login(user) {
    return API().post('users/login', {
      user: user // add our data to the request body
    })
  },
  changePassword(user_id, old_password, new_password) {
    return API().post('users/change_password', {
      user_id: user_id,
      old_password: old_password,
      new_password: new_password
    })
  },
  addUser(user) {
    return API().post('users/add', {
      user: user // add our data to the request body
    })
  },
  onboardUser(user) {
    return API().post('users/onboard', {
      user: user // add our data to the request body
    })
  },
  updateUser(id, user){
    return API().post('users/update/' + id, {
      updated_user: user
    })
  },
  addServiceWorkerSubscriptionForUser(user_id, subscription) {
    return API().post(`users/add_service_worker_subscription/${user_id}`, {
      subscription: subscription
    })
  },
  addServiceWorkerSubscriptionsToAllUsers() {
    return API().post('users/add_service_worker_subscriptions_to_all')
  },
  updateUserName(user_object_id, first_name, last_name) {
    return API().post(`users/update_user_name/${user_object_id}`, {
      first_name: first_name,
      last_name: last_name
    })
  },
  // DELETE ------------------------------
  deleteUser (id) {
    return API().delete('users/delete/' + id)
  }
}
