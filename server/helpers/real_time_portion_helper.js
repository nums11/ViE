const QRScan = require('../QRScan/QRScan.model');
const RealTimePortion = require('../RealTimePortion/RealTimePortion.model');
const QRScanHelper = require('./qr_scan_helper');

module.exports = {deleteRealTimePortion}

async function deleteRealTimePortion(real_time_portion_id,
	meeting_id, qr_scans) {
	try {
		let qr_scan_promises = []
		qr_scans.forEach(qr_scan => {
			qr_scan_promises.push(
				QRScanHelper.deleteQRScan(qr_scan._id, real_time_portion_id,
					qr_scan.submission_ids)
			)
		})
		const qr_scan_deletion_statuses =
			await Promise.all(qr_scan_promises)
		qr_scan_deletion_statuses.forEach(status => {
			if(!status)
				throw "<ERROR> deleteRealTimePortion deleting qr_scans"
		})
		const real_time_portion_promise = new Promise((resolve, reject) => {
			RealTimePortion.findByIdAndRemove(real_time_portion_id,
				(error) => {
					if(error) {
						console.log(`<ERROR> deleting real_time_portion with id`
							+ ` ${real_time_portion_id}`, error)
						reject(error)
					} else {
						resolve(true)
					}
				}
			)
		})
		await Promise.resolve(real_time_portion_promise)
		return true
	} catch(error) {
		console.log(`<ERROR> deleteRealTimePortion real_time_portion_id`
			+ ` ${real_time_portion_id} meeting_id ${meeting_id}`,
			error)
		return false
	}
}