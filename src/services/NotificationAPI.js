import API from '@/services/API'

export default {
  async notifyAllUsers() {
    return API().post('notifications/notify_all')
  }
}
