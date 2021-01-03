import API from '@/services/API'

export default {
  scheduleShowQRNotificationsForInstructors(primary_instructor_id,
    secondary_instructor_id, meeting_id, scheduled_qr_times) {
  	return API().post(`notifications/schedule_show_qr/${primary_instructor_id}` +
      `/${secondary_instructor_id}/${meeting_id}`, {
      	scheduled_qr_times: scheduled_qr_times
      })
  },
  getNotificationJobs() {
    return API().get('notifications')
  },
  notifyAllUsers() {
    return API().post('notifications/notify_all')
  }
}