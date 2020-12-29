import API from '@/services/API'

export default {
	getQRScan(id) {
	  return API().get('qrcheckins/get/' + id)
	},
	updateQRScan(id, qr_scan){
	  return API().post('qrcheckins/update/' + id, {
	    updated_qr_scan: qr_scan
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