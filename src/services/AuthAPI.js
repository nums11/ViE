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
  silentLogin(user) {
    return API().post(`auth/silent_login`, {
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
  setPassword (user_id, new_password, confirm_key) {
    return API().post(`auth/set_password/${user_id}`, {
      password: new_password,
      confirm_key: confirm_key
    })
  },
}
