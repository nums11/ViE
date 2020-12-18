const User = require('../User/User.model');

module.exports = {updateStudent}

async function updateStudent(student_id, operation, section) {
  let update_block = {
    pull_block: {},
    pull_all_block: {},
    push_block: {}
  }
  if(operation === "add_student_section") {
    update_block.push_block.student_sections = section._id
    update_block.push_block.meetings = section.meetings
  } else if(operation === "add_pending_approval_section") {
    update_block.push_block.pending_approval_sections = section._id
  } else if(operation === "approve_student") {
    update_block.pull_block.pending_approval_sections = section._id
    update_block.push_block.student_sections = section._id
    update_block.push_block.meetings = section.meetings
  } else if(operation === "deny_student") {
    update_block.pull_block.pending_approval_sections = section._id
  } else if(operation === "remove_student_section") {
    update_block.pull_block.student_sections = section._id
    update_block.pull_all_block.meetings = section.meetings
  }

  try {
    let update_promise = new Promise((resolve, reject) => {
      User.findByIdAndUpdate(student_id,
        {
          $push: update_block.push_block,
          $pull: update_block.pull_block,
          $pullAll: update_block.pull_all_block
        },
        {new: true},
        (error, updated_student) => {
          if(error) {
            console.log(`<ERROR> updating student with id ${student_id}`
              + ` and update_block`, update_block)
            reject(error)
          } else {
            resolve(updated_student)
          }
        }
      )
    })
    const updated_student = await Promise.resolve(update_promise)
    return updated_student
  } catch(error) {
    console.log(`<ERROR> updateStudent with student_id: ${student_id},` +
      ` operation: '${operation}', section_id: ${section._id}`, error)
    return null
  }
}