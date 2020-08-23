const QRCheckin = require('../QRCheckin/QRCheckin.model')

const has = (a, b) => { return Object.prototype.hasOwnProperty.call(a, b); }

const AttendanceFinder = {

  /* 
  
    find (task_info)
    @params task_info: Object
      @keys: 
        task_id:  String (ObjectID)
        type:     String ('qr-code', 'poll', 'recording', ...)

    @desc
      Search for the task in the collection of the associated type
      (qr-code => QRCheckin, poll => Poll, ...)
      for the document with _id = task_id.
      Return the submission array
  */
  find: async (task_info) => {
    console.log(task_info)

    // validate function parameters
    if (!task_info)                     throw new Error('No task_info provided')
    if (!has(task_info, 'task_id'))     throw new Error('No task_id in task_info')
    if (!has(task_info, 'type'))        throw new Error('No type in task_info')

    // Get the QR Submission
    if (task_info.type == 'qr-code') {

      return QRCheckin.findById(task_info.task_id)
      .populate('qr_checkin_submissions')
      .then(qr_doc => {
        
        // submissions is an array of LiveSubmission ObjectIDs
        let submissions = qr_doc.qr_checkin_submissions;
        return qr_doc.qr_checkin_submissions;

      })
      .catch(err => {
        throw new Error(err)
      })
    }
    else {
      // Default for types not yet implemented
      throw new Error(`Task type ${task_info.type} has not yet been implemented.`)
    }
  }
}

module.exports = AttendanceFinder