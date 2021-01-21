import API from '@/services/API'

export default {
  addQRScan(real_time_portion_id, qr_scan) {
    return API().post(
    	`real_time_portions/add_qr_scan/${real_time_portion_id}`, {
    		qr_scan: qr_scan
    	})
  },
}
