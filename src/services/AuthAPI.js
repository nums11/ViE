import API from '@/services/API'

export default {
  signUp(user) {
    return API().post('auth/signup', {
      user: user
    })
  },
  login(user) {
    return API().post('auth/login', {
      user: user
    })
  },
  loginStatus() {
    return API().get('auth/loginStatus')
  },
  logoutCAS() {
    return API().get('auth/logoutCAS')
  },
  checkForTempUser(user_id, temp_password) {
    return API().get('auth/check_for_temp_user/' + user_id + '/' + temp_password)
  },
  setPermanentPassword(user) {
    return API().post('auth/set_permanent_pasword', {
      user: user
    })
  },
  recordAuthHeaderUpdate(user_id) {
    return API().post('auth/record_auth_header_update', {
      user_id
    })
  },
  getUsersWithUpdatedAuthHeaders() {
    return API().get('auth/user_with_updated_auth_headers')
  },
}
