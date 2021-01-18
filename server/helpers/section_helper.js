const Section = require('../Section/Section.model');
const Course = require('../Course/Course.model');
const Meeting = require('../Meeting/Meeting.model');
const UserHelper = require('./user_helper')

module.exports = {handleStudent, deleteSection}

async function handleStudent(section_id, operation, student_id) {
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
    console.log(`<ERROR> handleStudent with section_id: ${section_id},` +
      ` operation: '${operation}', student_id: ${student_id}`, error)
    return null
  }
}

async function deleteSection(section_id, meeting_ids,
  student_ids, pending_approval_student_ids, instructor_id,
  course_id) {
  console.log("in deleteSection meeting_ids", meeting_ids)
  const section = {
    _id: section_id,
    meetings: meeting_ids
  }

  try {
    // Remove section from each of the students
    const student_update_promises = removeSectionFromUsers(
      student_ids, "normal_student", section)
    if(student_update_promises == null)
      throw "<ERROR> deleteSection removing section from "
        + "students"
    // Remove section from each of the pending students
    const pending_student_update_promises = removeSectionFromUsers(
      student_ids, "pending_student", section)
    if(pending_student_update_promises == null)
      throw "<ERROR> deleteSection removing section from "
        + "pending students"
    // Remove section from the course
    const course_promise = removeSectionFromCourse(
      section_id, course_id)
    if(course_promise == null)
      throw "<ERROR> deleteSection removing section from "
        + "course"
    // Remove section from meetings

    const meeting_promises = removeSectionFromMeetings(
      section_id, meeting_ids)
    if(meeting_promises == null)
      throw "<ERROR> deleteSection removing section from "
        + "meetings"
    // Delete section
    const section_promise = new Promise((resolve, reject) => {
      Section.findByIdAndRemove(section_id, function(error){
        if(error) {
          console.log(`<ERROR> deleteSection Deleting section`
            + ` with id ${section_id}`, error)
          reject(error)
        } else {
          console.log(`<SUCCESS> deleteSection Deleting section`
            + ` with id ${section_id}`)
          resolve(true)
        }
      });
    })

    const all_promises = [].concat.apply([], [
      student_update_promises, pending_student_update_promises,
      [course_promise, section_promise]])
    await Promise.all(all_promises)
    return true
  } catch(error) {
    console.log(`<ERROR> deleteSection section_id ${section_id}`
      + ` meeting_ids`, meeting_ids, `student_ids`, student_ids,
      ` pending_approval_student_ids`,pending_approval_student_ids,
      ` instructor_id ${instructor_id} course_id ${course_id}`,
      error)
    return false
  }
}

function removeSectionFromUsers(user_ids, user_type,
  section) {
  let operation = ""
  if(user_type === "pending_student")
    operation = "deny_student"
  else if(user_type === "normal_student")
    operation = "remove_student_section"

  try {
    let user_promises = []
    user_ids.forEach(user_id => {
      user_promises.push(new Promise((resolve, reject) => {
        const updated_user = UserHelper.updateUser(
          user_id, operation, section)
        if(updated_user == null) {
          console.log(`<ERROR> removeSectionFromUsers`
            + ` removing section`)
          reject(null)
        } else {
          resolve(updated_user)
        }
      }))
    })
    return user_promises
  } catch(error) {
    console.log(`<ERROR> removeSectionFromUsers user_type`,
      ` ${user_type} user_ids`, user_ids, "section",
      section)
    return null
  }
}

function removeSectionFromCourse(section_id, course_id) {
  try {
    const course_promise = new Promise((resolve,reject) => {
      Course.findByIdAndUpdate(course_id,
        {$pull: {sections: section_id}},
        (error, course) => {
          if(error) {
            console.log(`<ERROR> (sections/delete) updating course`
              + ` with id ${course_id} with section id ${section_id}`,
              error)
            reject(error)
          } else if(course == null) {
            console.log(`<ERROR> (sections/delete) could not find course`
              + ` with id ${course_id}`)
            reject(null)
          } else {
            resolve(course)
          }
        }
      )
    })
    return course_promise
  } catch(error) {
    console.log(`<ERROR> removeSectionFromCourse section_id`
      + ` ${section_id} course_id ${course_id}`, error)
    return null
  }
}

async function removeSectionFromMeetings(section_id, meeting_ids) {
  try {
    let section_removal_promises = []
    meeting_ids.forEach(meeting_id => {
      section_removal_promises.push(new Promise(
        (resolve, reject) => {
        Meeting.findByIdAndUpdate(meeting_id,
          {$pull: {sections: section_id}},
          {new: true},
          (error, updated_meeting) => {
            if(error) {
              console.log(`<ERROR> removeSectionFromMeetings updating`
                + ` meeting with id ${meeting_id} with section `
                ` with id ${section_id}`, error)
              reject(error)
            } else if(updated_meeting == null) {
              console.log(`<ERROR> removeSectionFromMeetings could not`
                ` find meeting with id ${meeting_id}`)
              reject(null)
            } else {
              resolve(updated_meeting)
            }
          }
        )
      }))
    })
    return section_removal_promises

    // If this was the only section for the meeting
    // Then delete the meeting and remove it from the
    // Instructors meetnigs
    // let meetings_to_be_deleted = []
    // updated_meetings.forEach(meeting => {
    //   if(meeting.sections.length === 0) {
    //     meetings_to_be_deleted.push(meeting)
    //   }
    // })
    // deleteMeetings(meetings)
  } catch(error) {
    console.log(`<ERROR> removeSectionFromMeetings`
      + ` section id ${section_id} meeting_ids`, meeting_ids)
    return null
  }
}


// Implement later
function deleteMeetings(meetings) {
  try {

  } catch(error) {
    console.log("<ERROR> deleteMeetings")
  }
}