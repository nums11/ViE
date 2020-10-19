import API from '@/services/API'

export default {
  async sendNotification() {
    // Send Push Notification
    console.log("Sending Push...");
    return API().post('notifications/send', {
      subscription: subscription
    }).then(() => {console.log("Push sent")})
  }
}
