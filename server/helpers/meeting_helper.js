const Meeting = require('../Meeting/Meeting.model');
const RealTimePortion = require('../RealTimePortion/RealTimePortion.model');
const AsyncPortion = require('../AsyncPortion/AsyncPortion.model');
const Section = require('../Section/Section.model');
const User = require('../User/User.model');
const QRScan = require('../QRScan/QRScan.model');
const Video = require('../Video/Video.model');
const Quiz = require('../Quiz/Quiz.model');
const QuizQuestion = require('../QuizQuestion/QuizQuestion.model');
const QRScanHelper = require('./qr_scan_helper')
const RealTimePortionHelper = require('./real_time_portion_helper')
const AsyncPortionHelper = require('./async_portion_helper')
const NotificationHelper = require('./notification_helper')
const QuizHelper = require('./quiz_helper')
const moment = require("moment");

module.exports = {addMeeting, getEarlierStartDate,
setRecurringIds, updateMeeting, deleteMeeting, getRecurringMeetings}

async function addMeeting(meeting, real_time_portion, async_portion,
  instructor_ids) {
  try {
    const new_meeting = new Meeting(meeting)
    let saved_meeting = await new_meeting.save()
    let saved_real_time_portion = null, saved_async_portion = null

    if(real_time_portion != null) {
      const [saved_qr_scans, updated_notification_jobs] = 
        await createQRScans(real_time_portion.qr_scans,
          instructor_ids, saved_meeting._id)
      if(saved_qr_scans == null) {
        throw "<ERROR> addMeeting saving qr scans and "
          + "scheduling notifications"
      }
      const saved_quizzes = await createQuizzes(
        real_time_portion.quizzes)
      if(saved_quizzes == null)
        throw "<ERROR> addMeeting saving quizzes"
      new_real_time_portion = new RealTimePortion({
        real_time_start: real_time_portion.real_time_start,
        real_time_end: real_time_portion.real_time_end,
        qr_scans: saved_qr_scans,
        quizzes: saved_quizzes
      })
      saved_real_time_portion = await new_real_time_portion.save()
    }

    if(async_portion != null) {
      const saved_videos = await createVideos(
        async_portion.videos)
      if(saved_videos == null)
        throw "<ERROR> addMeeting saving videos"
      new_async_portion = new AsyncPortion({
        async_start: async_portion.async_start,
        async_end: async_portion.async_end,
        videos: saved_videos
      })
      saved_async_portion = await new_async_portion.save()
    }

    saved_meeting.real_time_portion = saved_real_time_portion
    saved_meeting.async_portion = saved_async_portion
    saved_meeting.save()
    // Update the section, instructor, and students
    const updated_sections = await addMeetingToObjects(
      saved_meeting.sections, "section", saved_meeting._id)
    if(updated_sections == null)
      throw "<ERROR> addMeeting updating the section"
    const student_ids = getAllStudentsFromSections(
      updated_sections)
    const updated_students = await addMeetingToObjects(
      student_ids, "user", saved_meeting._id)
    if(updated_students == null)
      throw "<ERROR> addMeeting updating the students"
    const updated_instructors = await addMeetingToObjects(
      instructor_ids, "user", saved_meeting._id)
    if(updated_instructors == null)
      throw "<ERROR> addMeeting updating the instructors"

    return saved_meeting
  } catch(error) {
    console.log(`<ERROR> addMeeting meeting`, meeting,
      `real_time_portion`, real_time_portion, `async_portion`,
      async_portion, `instructor_ids`,instructor_ids, error)
    return null
  }
}

async function updateMeeting(meeting_id, meeting) {
  try {
    let qr_scan_promise;
    let real_time_portion_promise;
    if(meeting.real_time_portion != null){
      qr_scan_promise = updateQRScans(
        meeting.real_time_portion.qr_scans)
      real_time_portion_promise = updateRealTimePortion(
        meeting.real_time_portion)
    }
    let video_promise;
    let async_portion_promise;
    if(meeting.async_portion != null){
      video_promise = updateVideos(meeting.async_portion.videos)
      async_portion_promise = updateAsyncPortion(
        meeting.async_portion)
    }
    let meeting_promise = updateMeetingTitle(meeting_id,
      meeting.title)
    const updated_qr_scans = await Promise.resolve(qr_scan_promise)
    const updated_videos = await Promise.resolve(video_promise)
    const updated_real_time_portion =
      await Promise.resolve(real_time_portion_promise)
    const updated_async_portion =
      await Promise.resolve(async_portion_promise)
    const updated_meeting = await Promise.resolve(meeting_promise)
    return {
      updated_qr_scans: updated_qr_scans,
      updated_videos: updated_videos,
      updated_real_time_portion: updated_real_time_portion,
      updated_async_portion: updated_async_portion,
      updated_meeting: updated_meeting
    }
  } catch(error) {
    console.log(`<ERROR> updateMeeting meeting_id ${meeting_id}`,
      ` meeting`, meeting, error)
    return null
  }
}

async function deleteMeeting(meeting_id, real_time_portion_id,
  async_portion_id, qr_scans, videos) {
  try {
    let real_time_portion_promise = null;
    if(real_time_portion_id != null) {
      real_time_portion_promise = 
        RealTimePortionHelper.deleteRealTimePortion(
          real_time_portion_id, meeting_id, qr_scans)
    }
    let async_portion_promise = null
    if(async_portion_id != null) {
      async_portion_promise =
        AsyncPortionHelper.deleteAsyncPortion(
          async_portion_id, meeting_id, videos)
    }
    const meeting_promise = new Promise((resolve, reject) => {
      Meeting.findByIdAndRemove(meeting_id,
        (error) => {
          if(error) {
            console.log(`<ERROR> deleteMeeting deleting meeting with`
              + ` id ${meeting_id}`)
            reject(error)
          } else {
            resolve(true)
          }
        }
      )
    })
    if(real_time_portion_promise != null) {
      const deletion_status = await Promise.resolve(
        real_time_portion_promise)
      if(! deletion_status)
        throw "<ERROR> deleteMeeting deleting real_time_portion"
    }
    if(async_portion_promise != null) {
      const deletion_status = await Promise.resolve(
        async_portion_promise)
      if(! deletion_status)
        throw "<ERROR> deleteMeeting deleting async_portion"
    }
    await Promise.resolve(meeting_promise)
    return true
  } catch(error) {
    console.log(`<ERROR> deleteMeeting meeting_id ${meeting_id}`
      + ` real_time_portion_id ${real_time_portion_id}`
      + ` async_portion_id ${async_portion_id} qr_scans`,qr_scans,
      + `videos`,videos,error)
    return false
  }
}

async function getRecurringMeetings(recurring_id) {
  try {
    const recurring_meetings_promise = new Promise(
      (resolve, reject) => {
      Meeting.find({recurring_id: recurring_id})
      .populate({
        path: 'real_time_portion',
        populate: {
          path: 'qr_scans'
        }
      })
      .populate({
        path: 'async_portion',
        populate: {
          path: 'videos',
          populate: {
            path: 'quiz'
          }
        }
      })
      .exec((error, meetings) => {
        if(error) {
          console.log(`<ERROR> getRecurringMeetings recurring_id`
            + ` ${recurring_id}`, error)
          reject(error)
        } else if(meetings.length === 0) {
          console.log(`<ERROR> getRecurringMeetings no meetings`
            + ` with recurring_id ${recurring_id} found`)
          reject(null)
        } else {
          resolve(meetings)
        }
      })
    })
    const recurring_meetings =
      await Promise.resolve(recurring_meetings_promise)
    return recurring_meetings
  } catch(error) {
    console.log(`<ERROR> getRecurringMeetings recurring_id`
      + ` recurring_id`, error)
    return null
  }
}

async function updateQRScans(qr_scans) {
  try {
    let qr_scan_promises = []
    qr_scans.forEach(qr_scan => {
      qr_scan_promises.push(new Promise((resolve,reject) => {
        QRScan.findByIdAndUpdate(qr_scan._id,
          {reminder_time: qr_scan.reminder_time},
          {new: true},
          (error, updated_qr_scan) => {
            if(error) {
              console.log(`<ERROR> updateQRScans updating qr_scan with`
              + ` id ${qr_scan._id} with reminder_time `
              + `${qr_scan.reminder_time}`,error)
              reject(error)
            } else if(updated_qr_scan == null) {
              console.log(`<ERROR> updateQRScans could not find`
                + ` qr_scan with id ${qr_scan._id} `)
              reject(null)
            } else {
              resolve(updated_qr_scan)
            }
          }
        )
      }))
    })
    const updated_qr_scans = await Promise.all(qr_scan_promises)
    return updated_qr_scans
  } catch(error) {
    console.log("<ERROR> updateQRScans qr_scans", qr_scans,
      error)
    return null
  }
}

async function updateVideos(videos) {
  try {
    let video_promises = []
    videos.forEach(video => {
      video_promises.push(new Promise((resolve,reject) => {
        Video.findByIdAndUpdate(video._id,
          {
            name: video.name,
            allow_unrestricted_viewing_for_real_time_submitters:
            video.allow_unrestricted_viewing_for_real_time_submitters,
            allow_faster_viewing: video.allow_faster_viewing
          },
          {new: true},
          (error, updated_video) => {
            if(error) {
              console.log(`<ERROR> updateVideos updating video with`
              + ` id ${video._id} with name ${video.name}`,error)
              reject(error)
            } else if(updated_video == null) {
              console.log(`<ERROR> updateVideos could not find`
                + ` video with id ${video._id}`)
              reject(null)
            } else {
              resolve(updated_video)
            }
          }
        )
      }))
    })
    const updated_videos = await Promise.all(video_promises)
    return updated_videos
  } catch(error) {
    console.log("<ERROR> updateVideos videos", videos,
      error)
    return null
  }
}

async function updateRealTimePortion(real_time_portion) {
  try {
    const real_time_portion_promise = new Promise(
      (resolve, reject) => {
        RealTimePortion.findByIdAndUpdate(real_time_portion._id,
          {
            real_time_start: real_time_portion.real_time_start,
            real_time_end: real_time_portion.real_time_end
          },
          {new: true},
          (error, updated_real_time_portion) => {
            if(error) {
              console.log(`<ERROR> updateRealTimePortion updating`
                + ` real_time_portion with id ${real_time_portion._id}`
                + ` real_time_start ${real_time_portion.real_time_start}`
                + ` real_time_end ${real_time_portion.real_time_end}`,
                error)
              reject(error)
            } else if(updated_real_time_portion == null) {
              console.log(`<ERROR> updateRealTimePortion real_time_portion`
                + ` with id ${real_time_portion._id} not found`)
              reject(null)
            } else {
              resolve(updated_real_time_portion)
            }
          }
        )
      })
    const updated_real_time_portion
      = await Promise.resolve(real_time_portion_promise)
    return updated_real_time_portion
  } catch(error) {
    console.log("<ERROR> updateRealTimePortion real_time_portion",
      real_time_portion, error)
    return null
  }
}

async function updateAsyncPortion(async_portion) {
  try {
    const async_portion_promise = new Promise(
      (resolve, reject) => {
        AsyncPortion.findByIdAndUpdate(async_portion._id,
          {
            async_start: async_portion.async_start,
            async_end: async_portion.async_end
          },
          {new: true},
          (error, updated_async_portion) => {
            if(error) {
              console.log(`<ERROR> updateAsyncPortion updating`
                + ` async_portion with id ${async_portion._id}`
                + ` async_start ${async_portion.async_start}`
                + ` async_end ${async_portion.async_end}`,
                error)
              reject(error)
            } else if(updated_async_portion == null) {
              console.log(`<ERROR> updateAsyncPortion async_portion`
                + ` with id ${async_portion._id} not found`)
              reject(null)
            } else {
              resolve(updated_async_portion)
            }
          }
        )
      })
    const updated_async_portion
      = await Promise.resolve(async_portion_promise)
    return updated_async_portion
  } catch(error) {
    console.log("<ERROR> updateAsyncPortion async_portion",
      async_portion, error)
    return null
  }
}

async function updateMeetingTitle(meeting_id, title) {
  try {
    const meeting_promise = new Promise((resolve,reject) => {
      Meeting.findByIdAndUpdate(meeting_id,
        {title: title},
        {new: true},
        function (error, updated_meeting) {
          if (error) {
            console.log(`<ERROR> updateMeetingTitle meeting_id ${meeting_id}`
              + ` meeting`, meeting, error)
            reject(error)
          } else if(updated_meeting == null) {
            console.log(`<ERROR> updateMeetingTitle meeting with id ${meeting_id}`
              + ` not found`)
            reject(null)
          } else {
            resolve(updated_meeting)
          }
        }
      );
    })
    const updated_meeting = await Promise.resolve(meeting_promise)
    return updated_meeting
  } catch(error) {
    console.log(`<ERROR> updateMeetingTitle meeting_id ${meeting_id}`,
      ` title ${title}`,error)
  }
}

function getEarlierStartDate(real_time_portion, async_portion) {
  let earlier_start_date;
  if(real_time_portion == null) {
    earlier_start_date = async_portion.async_start
  } else if(async_portion == null) {
    earlier_start_date = real_time_portion.real_time_start
  } else {
    if(moment(real_time_portion.real_time_start)
        .isBefore(async_portion.async_start)) {
      earlier_start_date
        = real_time_portion.real_time_start
    } else {
      earlier_start_date = async_portion.async_start
    }
  }
  return earlier_start_date
}

async function setRecurringIds(meetings) {
  try {
    const recurring_id = meetings[0]._id
    let recurring_id_promises = []
    meetings.forEach(meeting => {
      recurring_id_promises.push(new Promise(
        async (resolve,reject) => {
        meeting.recurring_id = recurring_id
        try {
          await meeting.save()
          resolve(meeting)
        } catch(error) {
          console.log("<ERROR> saving meeting with new recurring_id")
          reject(error)
        }
      }))
    })
    const meetings_with_recurring_ids =
      await Promise.all(recurring_id_promises)
    return meetings_with_recurring_ids
  } catch(error) {
    console.log("<ERROR> setRecurringIds meetings", meetings, error)
    return null
  }
}

async function addMeetingToObjects(object_ids, object_type, meeting_id) {
  try {
    let update_promises = []
    object_ids.forEach(object_id => {
      update_promises.push(new Promise(async (resolve,reject) => {
        if(object_type === "section") {
          Section.findByIdAndUpdate(object_id,
            {$push: {meetings: meeting_id}},
            {new: true},
            (error, section) => {
              if(error) {
                console.log("<ERROR> (meetings/add) updating section",error)
                reject(section)
              } else {
                resolve(section)
              }
            }
          )
        } else if(object_type === "user") {
          User.findByIdAndUpdate(object_id,
            {$push: {meetings: meeting_id}},
            {new: true},
            (error, user) => {
              if(error) {
                console.log("<ERROR> (meetings/add) updating user",error)
                reject(user)
              } else {
                resolve(user)
              }
            }
          )
        }
      }))
    })
    let updated_objects = await Promise.all(update_promises)
    return updated_objects
  } catch(error) {
    console.log("<ERROR> in addMeetingToObjects for object_ids",
     object_ids,"with object type",object_type,"and meeting_id",meeting_id,error)
    return null
  }
}

function getAllStudentsFromSections(sections) {
  let all_students = []
  sections.forEach(section => {
    all_students = all_students.concat(section.students)
  })
  return all_students
}

async function createQRScans(qr_scans, instructor_ids, meeting_id) {
  try {
    let qr_scan_promises = []
    let notifcation_schedule_promises = []
    for(let i = 0; i < qr_scans.length; i++) {
      qr_scan_promises.push(new Promise(async (resolve, reject) => {
        const random_code = QRScanHelper.generateRandomCode() 
        const qr_scan = new QRScan({
          code: random_code,
          reminder_time: qr_scans[i].reminder_time
        })
        try {
          const saved_qr_scan = await qr_scan.save()
          resolve(saved_qr_scan)
          const reminder_time = qr_scans[i].reminder_time
          if(reminder_time != null) {
            console.log("reminder_time", reminder_time)
            notifcation_schedule_promises.push(new Promise(async (resolve, reject) => {
              const updated_notification_job =
                await NotificationHelper.scheduleShowQRNotification(
                reminder_time, instructor_ids, meeting_id,
                saved_qr_scan._id)
              if(updated_notification_job == null)
                reject(null)
              else
                resolve(updated_notification_job)
            }))
          }
        } catch(error) {
          reject(null)
          console.log("<ERROR> createQRScans saving QR Scan")
        }
      }))
    }
    const saved_qr_scans = await Promise.all(qr_scan_promises)
    const updated_notification_jobs = await 
      Promise.all(notifcation_schedule_promises)
    return [saved_qr_scans, updated_notification_jobs]
  } catch(error) {
    console.log(`<ERROR> createQRScans qr_scans: ${qr_scans}`, error)
    return [null, null]
  }
}

async function createVideos(videos) {
  try {
    let video_promises = []
    videos.forEach(video => {
      video_promises.push(new Promise(async (resolve, reject) => {
        try {
          let saved_quiz = null
          if(video.quiz != null) {
            saved_quiz = await QuizHelper.createQuiz(video.quiz)
            if(saved_quiz == null)
              throw "Error saving quiz"
          }
          const new_video = new Video({
            name: video.name,
            url: video.url,
            allow_unrestricted_viewing_for_real_time_submitters:
            video.allow_unrestricted_viewing_for_real_time_submitters,
            allow_faster_viewing: video.allow_faster_viewing,
            quiz: saved_quiz
          })
          const saved_video = await new_video.save()
          resolve(saved_video)
        } catch(error) {
          console.log("<ERROR> createVideos saving quiz",
            video.quiz, error)
          reject(error)
        }
      }))
    })
    const saved_videos = await Promise.all(video_promises)
    return saved_videos
  } catch(error) {
    console.log(`<ERROR> createVideos videos:`,videos, error)
    return null
  }
}

async function createQuizzes(quizzes) {
  try {
    const quiz_creation_promises = []
    quizzes.forEach(quiz => {
      quiz_creation_promises.push(new Promise(
        async (resolve,reject) => {
        try {
          const saved_quiz = await QuizHelper.createQuiz(quiz)
          if(saved_quiz == null) {
            console.log("<ERROR> createQuizzes saving quiz", quiz,
              error)
            reject(null)
          }
          resolve(saved_quiz)
        } catch(error) {
          console.log("<ERROR> createQuizzes saving quiz", quiz,
            error)
          reject(null)
        }
        })
      )
    })
    const saved_quizzes = await Promise.all(
      quiz_creation_promises)
    return saved_quizzes
  } catch(error) {
    console.log("<ERROR> createQuizzes", quizzes, error)
    return null
  }
}