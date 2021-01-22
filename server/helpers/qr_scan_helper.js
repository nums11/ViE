const QRScan = require('../QRScan/QRScan.model');
const RealTimePortion = require('../RealTimePortion/RealTimePortion.model');
const SubmissionHelper = require('./submission_helper');

module.exports = {generateRandomCode, deleteQRScan}

function generateRandomCode() {
  const alnums = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 100; i > 0; --i) {
    result += alnums[Math.floor(Math.random() * alnums.length)];
  }
  return result;
}

async function deleteQRScan(qr_scan_id, real_time_portion_id,
	submission_ids) {
	try {
		const real_time_portion_promise = removeQRScanFromRealTimePortion(
			qr_scan_id, real_time_portion_id)
		const submission_promise =
			SubmissionHelper.deleteSubmissions(submission_ids)
		const qr_scan_promise = new Promise((resolve, reject) => {
			QRScan.findByIdAndRemove(qr_scan_id,
				(error) => {
					if(error) {
						console.log(`<ERROR> deleteQRScan deleting qr_scan with`
							+ ` id ${qr_scan_id}`, error)
						reject(error)
					} else {
						resolve(true)
					}
				}
			)
		})
		const deletion_promises = await Promise.all([
			real_time_portion_promise, submission_promise, qr_scan_promise])
		if(deletion_promises[0] == null)
			throw "<ERROR> deleteQRScan removing qr scan from real_time_portion"
		if(deletion_promises[1] == false)
			throw "<ERROR> deleteQRScan deleting submissions"
		return true
	} catch(error) {
		console.log(`<ERROR> deleteQRScan qr_scan_id ${qr_scan_id}`,
			error)
		return false
	}
}

async function removeQRScanFromRealTimePortion(qr_scan_id,
	real_time_portion_id) {
	try {
		const real_time_portion_promise = new Promise((resolve, reject) => {
			RealTimePortion.findByIdAndUpdate(real_time_portion_id,
				{$pull: {qr_scans: qr_scan_id}},
				(error, real_time_portion) => {
					if(error) {
						console.log(`<ERROR> removeQRScanFromRealTimePortion updating`
							+ ` real_time_portion with id ${real_time_portion_id} and`
							+ ` qr_scan_id ${qr_scan_id}`, error)
						reject(error)
					} else if(real_time_portion == null) {
						console.log(`<ERROR> removeQRScanFromRealTimePortion`
							+ ` real_time_portion with id ${real_time_portion_id} not found`)
						reject(null)
					} else {
						resolve(real_time_portion)
					}
				}
			)
		})
		const updated_real_time_portion = 
			await Promise.resolve(real_time_portion_promise)
		return updated_real_time_portion
	} catch(error) {
		console.log(`<ERROR> removeQRScanFromRealTimePortion`
			+ ` qr_scan_id ${qr_scan_id} real_time_portion_id `
			+ `${real_time_portion_id}`, error)
		return null
	}
}