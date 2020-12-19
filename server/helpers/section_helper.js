const Section = require('../Section/Section.model');

module.exports = {updateSection, handleInvitedStudent}

async function updateSection(section_id, operation, student_id) {
  let update_block = {
    pull_block: {},
    push_block: {}
  }
  if(operation === "add_student") {
    update_block.push_block.students = student_id
  } else if(operation === "add_pending_approval_student") {
    update_block.push_block.pending_approval_students = student_id
  } else if(operation === "approve_student") {
    update_block.pull_block.pending_approval_students = student_id
    update_block.push_block.students = student_id
  } else if(operation === "deny_student") {
    update_block.pull_block.pending_approval_students = student_id
  } else if(operation === "remove_student") {
    update_block.pull_block.students = student_id
  }

  try {
    let update_promise = new Promise((resolve, reject) => {
      Section.findByIdAndUpdate(section_id,
        {
          $push: update_block.push_block,
          $pull: update_block.pull_block
        },
        {new: true},
        (error, updated_section) => {
          if(error) {
            console.log(`<ERROR> updating section with id ${section_id}`
              + ` and update_block`, update_block)
            reject(error)
          } else {
            resolve(updated_section)
          }
        }
      )
    })
    const updated_section = await Promise.resolve(update_promise)
    return updated_section
  } catch(error) {
    console.log(`<ERROR> updateSection with section_id: ${section_id},` +
      ` operation: '${operation}', student_id: ${student_id}`, error)
    return null
  }
}

async function handleInvitedStudent(section_id, student_id, operation,
  invite_code) {
  try {
    let set_block = {}
    let unset_block = {}
    const key = `invited_students.${student_id}`
    if(operation === "add") {
      set_block[key] = invite_code
    } else if(operation === "remove") {
      unset_block[key] = invite_code
    }

    let update_promise = new Promise((resolve, reject) => {
      Section.findByIdAndUpdate(section_id,
        {
          $set: set_block,
          $unset: unset_block
        },
        {new: true},
        (error, section) => {
          if(error) {
            console.log(`<ERROR> adding to map for section_id:${section_id},`
            + `student_id: ${student_id}, and invite_code: ${invite_code}`)
            reject(error)
          } else {
            resolve(section)
          }
        }
      )
    })
    const updated_section = await Promise.resolve(update_promise)
    return updated_section
  } catch(error) {
    console.log(`<ERROR> addInvitedStudentToSection section_id: ${section_id},`
      + ` student_id: ${student_id}, invite_code: ${invite_code}`, error)
    return null
  }
}