import API from '@/services/API'

export default {
  addQRScan(real_time_portion_id, qr_scan, meeting_id,
    instructor_ids) {
    return API().post(
    	`real_time_portions/add_qr_scan/${real_time_portion_id}`, {
    		qr_scan: qr_scan,
        meeting_id: meeting_id,
        instructor_ids: instructor_ids
    	})
  },
  deleteRealTimePortion(real_time_portion_id, meeting_id,
  	qr_scans) {
  	return API().delete(
  		`real_time_portions/delete/${real_time_portion_id}`, {
  			data: {
  				meeting_id: meeting_id,
  				qr_scans: qr_scans
  			}
  		})
  }
}
