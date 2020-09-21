import API from '@/services/API'

export default {
	getQRCheckin(id) {
	  return API().get('qrcheckins/get/' + id)
	},
	updateQRCheckin(id, qr_checkin){
	  return API().post('qrcheckins/update/' + id, {
	    updated_qr_checkin: qr_checkin
	  })
	},
  attendQR (user_id, meeting_id, qr_code) {

    return API().post(`qrcheckins/attend`, {
      user_id,
      meeting_id,
      qr_code
    })

  }

}