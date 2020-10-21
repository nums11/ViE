import API from '@/services/API'

export default {
  sendShowQRNotificationToInstructors(primary_instructor_id,
    secondary_instructor_id, meeting_id) {
    return API().post(`notifications/show_qr/${primary_instructor_id}` +
      `/${secondary_instructor_id}/${meeting_id}`)
  },
  scheduleShowQRNotificationForInstructors(primary_instructor_id,
    secondary_instructor_id, meeting_id, qr_checkin_start_time) {
  	return API().post(`notifications/schedule_show_qr/${primary_instructor_id}` +
      `/${secondary_instructor_id}/${meeting_id}`, {
      	qr_checkin_start_time: qr_checkin_start_time
      })
  },
  notifyAllUsers() {
    return API().post('notifications/notify_all')
  }
}
