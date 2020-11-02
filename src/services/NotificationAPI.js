import API from '@/services/API'

export default {
  scheduleShowQRNotificationForInstructors(primary_instructor_id,
    secondary_instructor_id, meeting_id, qr_checkin_start_time) {
  	return API().post(`notifications/schedule_show_qr/${primary_instructor_id}` +
      `/${secondary_instructor_id}/${meeting_id}`, {
      	qr_checkin_start_time: qr_checkin_start_time
      })
  },
  getNotificationJobs() {
    return API().get('notifications')
  },
  notifyAllUsers() {
    return API().post('notifications/notify_all')
  }
}