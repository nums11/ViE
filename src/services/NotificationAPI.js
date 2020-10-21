import API from '@/services/API'

export default {
  sendShowQRNotificationToInstructors(primary_instructor_id,
    secondary_instructor_id, meeting_id) {
    return API().post(`notifications/show_qr/${primary_instructor_id}` +
      `/${secondary_instructor_id}/${meeting_id}`)
  },
  notifyAllUsers() {
    return API().post('notifications/notify_all')
  }
}
