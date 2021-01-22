import API from '@/services/API'

export default {
	// DELETE -----------------
	deleteQRScan(qr_scan_id, real_time_portion_id,
		submission_ids) {
		return API().delete(`qr_scans/delete/${qr_scan_id}`, {
			data: {
		  	real_time_portion_id: real_time_portion_id,
		  	submission_ids: submission_ids
			}
		})
	},
}