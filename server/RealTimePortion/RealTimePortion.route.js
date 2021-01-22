const express = require('express');
const realTimePortionRoutes = express.Router();
const RealTimePortion = require('../RealTimePortion/RealTimePortion.model');
const QRScan = require('../QRScan/QRScan.model');
const QRScanHelper = require('../helpers/qr_scan_helper')

realTimePortionRoutes.post('/add_qr_scan/:real_time_portion_id',
  async function(req, res, next) {
  const real_time_portion_id = req.params.real_time_portion_id
  const qr_scan = req.body.qr_scan

  try {
    const new_qr_scan = new QRScan(qr_scan)
    new_qr_scan.code = QRScanHelper.generateRandomCode()
    const saved_qr_scan = await new_qr_scan.save()
    RealTimePortion.findByIdAndUpdate(real_time_portion_id,
      {$push: {qr_scans: saved_qr_scan}},
      {new: true},
      (error, updated_real_time_portion) => {
        if(error) {
          console.log(`<ERROR> (real_time_portions/add_qr_scan)`,
            ` updating real_time_portion with id ${real_time_portion_id}`,
            ` with qr_scan`, qr_scan)
          next(error)
        } else if(updated_real_time_portion == null) {
          console.log(`<ERROR> (real_time_portions/add_qr_scan) could not`,
            + ` find real_time_portion with id ${real_time_portion_id}`)
          res.status(404).json("real_time_portion not found")
        } else {
          console.log("<SUCCESS> (real_time_portions/add_qr_scan)")
          res.json(saved_qr_scan)
        }
      }
    )
  } catch(error) {
    console.log(`<ERROR> (real_time_portions/add_qr_scan)`
      + ` real_time_portion_id: ${real_time_portion_id}`
      + ` qr_scan`, qr_scan)
    next(error)
  }
})



module.exports = realTimePortionRoutes;
