import API from '@/services/API'

export default {

  attendQR (user_id, meeting_id, qr_code) {

    return API().post(`qrcheckin/attend`, {
      user_id,
      meeting_id,
      qr_code
    })

  }

}