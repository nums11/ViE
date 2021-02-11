const SubmissionHelper = require('./submission_helper')

module.exports = {handleQRSocketEvents}

function handleQRSocketEvents(io, socket, real_time_qr_scan_ids) {
	socket.on('startRealTimeQRScan', (qr_scan_id) => {
	  console.log(`Starting real-time qr scan for id ${qr_scan_id}`)
	  real_time_qr_scan_ids.set(qr_scan_id, socket.id)
	})

	socket.on('endRealTimeQRScan', (qr_scan_id) => {
	  console.log(`Ending real-time qr scan for id ${qr_scan_id}`)
	  real_time_qr_scan_ids.delete(qr_scan_id)
	})

	// Remove the qr_scan id if the instructor closes out of Vie
	// before closing the qr scanning window
	socket.on('disconnect', () => {
	  const iter = real_time_qr_scan_ids.entries()
	  let value_exists = true
	  let entry;
	  while(value_exists) {
	    entry = iter.next().value
	    if(entry == null){
	      value_exists = false
	    } else {
	      const qr_scan_id = entry[0]
	      const instructor_socket_id = entry[1]
	      if(instructor_socket_id === socket.id){
	        console.log("Removing socket from real_time_qr_scan_ids")
	        real_time_qr_scan_ids.delete(qr_scan_id)
	        value_exists = false
	      }
	    }
	  }
	});

	socket.on('attemptQRScanSubmission', async (qr_scan_id, first_name,
	  last_name, user_id, user_object_id, cb) => {
	  console.log(`received submitToQRScan event for qr_scan_id ${qr_scan_id}`
	    + ` user_id ${user_id}`)
	  const instructor_socket_id = real_time_qr_scan_ids.get(qr_scan_id)
	  if(instructor_socket_id == null)
	    cb(false, null)
	  else {
	    const submission = {
	      submitter: user_object_id,
	      task_type:"QRScan"
	    }
	    const updated_qr_scan = await SubmissionHelper.addQRSubmission(
	      qr_scan_id, submission)
	    if(updated_qr_scan == null) {
	      cb(true, false)
	    } else {
	      cb(true, true)
	      io.to(instructor_socket_id).emit('addStudentSubmission',
	        {
	          first_name: first_name,
	          last_name: last_name,
	          user_id: user_id
	        }
	      )
	    }
	  }
	})
}