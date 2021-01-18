const Course = require('../Course/Course.model');
const Section = require('../Section/Section.model');

module.exports = {createSectionsAndAddToCourse}

async function createSectionsAndAddToCourse(sections, course_id, route) {
    // Save Sections
  try {
    let section_promises = []
    sections.forEach(section => {
      section_promises.push(new Promise(async (resolve,reject) => {
        section.join_code = getJoinCodeForSection(section.section_number,
          course_id)
        section.course = course_id
        let new_section = new Section(section)
        try {
          let saved_section = await new_section.save()
          resolve(saved_section)
        } catch(error) {
          console.log(`<ERROR> (${route}) saving section`,section, error)
          reject(error)
        }
      }))
    })
    let saved_sections = await Promise.all(section_promises)

    // Update the course
    let course_update_promise = new Promise((resolve, reject) => {
      Course.findByIdAndUpdate(course_id,
        {$push: {sections: {$each: saved_sections}}},
        {new: true},
        (error, updated_course) => {
          if(error) {
            console.log(`<ERROR> (${route}) Updating course with new sections`,
              updated_course, error)
            reject(error)
          } else {
            resolve(updated_course)
          }
        }
      )
    })
    let updated_course = await Promise.resolve(course_update_promise)
    return {
      updated_course: updated_course,
      saved_sections: saved_sections
    }
  } catch (error) {
    console.log(`<ERROR> createSectionsAndAddToCourse from ${route} route`,
      error)
    return null
  }
}

function getJoinCodeForSection(section_number, course_id) {
  let random_string = generateRandomString()
  return `${section_number}${course_id}${random_string}`
}

function generateRandomString() {
  let length = 10,
      charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      str = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
      str += charset.charAt(Math.floor(Math.random() * n))
  }
  return str
}
