const express = require('express');
const emailRoutes = express.Router();
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
 service: 'gmail',
 auth: {
   user: 'vie.do.not.reply@gmail.com',
   pass: process.env.EMAIL_PASS
 }
});

emailRoutes.route('/invite').post(
  async function (req, res, next) {
  const course_name = req.body.course_name
  const course_subject_code = req.body.course_subject_code
  const course_number = req.body.course_number
  const section_number = req.body.section_number
  const instructor_name = req.body.instructor_name
  const join_code = req.body.join_code
  const student_emails = req.body.student_emails
  const subject = getEmailSubject(course_name, section_number)
  const body = getEmailBody(instructor_name, course_name,
    course_subject_code, course_number, section_number, join_code)
  try {
    // let mail_promises = []
    let email_statuses = []
    student_emails.forEach(async student_email => {
      // mail_promises.push(new Promise((resolve,reject) => {
      const mail_options = getMailOptions(student_email,
        subject, body)
      const mail_promise = new Promise((resolve, reject) => {
        transporter.sendMail(mail_options, function(error, info){
          if (error) {
            console.log("<ERROR> sending invite email", error);
            reject(student_email)
          } else {
            console.log("sent mail", student_email)
            resolve(student_email)
          }
        });
      })
      const email_status = await Promise.resolve(mail_promise)
      email_statuses.push(email_status)
      // }))
    })
    // const email_statuses = await Promise.allSettled(mail_promises)
    console.log("<SUCCESS> (emails/invite)")
    res.json(email_statuses)
  } catch(error) {
    console.log(`<ERROR> (emails/invite) course_name: ${course_name}`
      + ` course_subject_code: ${course_subject_code} course_number`
      + ` ${course_number} section_number: ${section_number} `
      + ` instructor_name: ${instructor_name} join_code: ${join_code}`
      + ` student_emails:`, student_emails)
    next(error)
  }
});

emailRoutes.route('/reset_password').post(
  async function (req, res, next) {
  const email = req.body.email
  const user_id = req.body.user_id
  const subject = "ViE - Reset Your Password"
  const body = "Someone requested a password reset for your account "
    + ` with the user id <strong>${user_id}</strong>.`
    + "If this was not you, please contact viengagecontact@gmail.com "
    + "so we can take the proper security measures.<br/><br/> "
    + "Follow this link to reset your password: "
    + `https://viengage.com/#/reset_password/${email}`

  try {
    const mail_options = getMailOptions(email,
      subject, body)
    const mail_promise = new Promise((resolve, reject) => {
      transporter.sendMail(mail_options, function(error, info){
        if (error) {
          console.log("<ERROR> sending reset password email", error);
          reject(error)
        } else {
          resolve(info)
        }
      });
    })
    const email_info = await Promise.resolve(mail_promise)
    console.log("<SUCCESS> (emails/reset_password)")
    res.json(email_info)
  } catch(error) {
    console.log(`<ERROR> (emails/invite) email: ${email}`)
    next(error)
  }
});

emailRoutes.route('/new_student').post(
  async function (req, res, next) {
  const instructor_email = req.body.instructor_email
  const student_name = req.body.student_name
  const course_name = req.body.course_name
  const course_subject_code = req.body.course_subject_code
  const course_number = req.body.course_number
  const section_number = req.body.section_number
  const open_enrollment = req.body.open_enrollment

  const subject =
    `ViE - ${student_name} ${open_enrollment ? 'Joined' : 'Requested To Join'}`
    + ` Your Course`
  const body = `${student_name} ${open_enrollment ? 'joined' : 'requested to join'}`
    + ` your course - ${course_name}`
    + ` (${course_subject_code} ${course_number}) Section ${section_number}`
    + `<br/><br/>--<br/>`
    + `ViE - Increase Virtual Engagement</p>`

  try {
    const mail_options = getMailOptions(instructor_email,
      subject, body)
    const mail_promise = new Promise((resolve, reject) => {
      transporter.sendMail(mail_options, function(error, info){
        if (error) {
          console.log("<ERROR> sending new student mail", error);
          reject(error)
        } else {
          resolve(info)
        }
      });
    })
    const email_info = await Promise.resolve(mail_promise)
    console.log("<SUCCESS> (emails/new_student)")
    res.json(email_info)
  } catch(error) {
    console.log(`<ERROR> (emails/new_student) instructor_email:`
      + ` ${instructor_email} student_name ${student_name}`
      + ` course_name ${course_name} course_subject_code`
      + ` ${course_subject_code} course_number ${course_number}`
      + ` section_number ${section_number}`)
    next(error)
  }
});

emailRoutes.route('/approve_or_deny').post(
  async function (req, res, next) {
  const student_email = req.body.student_email
  const instructor_name = req.body.instructor_name
  const course_name = req.body.course_name
  const course_subject_code = req.body.course_subject_code
  const course_number = req.body.course_number
  const section_number = req.body.section_number
  const is_approval = req.body.is_approval

  const subject =
    `ViE - Your Course Join Request Has Been `
    + `${is_approval ? 'Approved' : 'Denied'}`
  const body =
    `${instructor_name} has`
    + ` ${is_approval ? 'approved you into' : 'denied you from'}`
    + ` thier course - ${course_name}`
    + ` (${course_subject_code} ${course_number}) Section ${section_number}`
    + `<br/><br/>--<br/>`
    + `ViE - Increase Virtual Engagement</p>`

  try {
    const mail_options = getMailOptions(student_email,
      subject, body)
    const mail_promise = new Promise((resolve, reject) => {
      transporter.sendMail(mail_options, function(error, info){
        if (error) {
          console.log("<ERROR> sending approve or deny mail", error);
          reject(error)
        } else {
          resolve(info)
        }
      });
    })
    const email_info = await Promise.resolve(mail_promise)
    console.log("<SUCCESS> (emails/approve_or_deny)")
    res.json(email_info)
  } catch(error) {
    console.log(`<ERROR> (emails/approve_or_deny) student_email:`
      + ` ${student_email} instructor_name ${instructor_name}`
      + ` course_name ${course_name} course_subject_code`
      + ` ${course_subject_code} course_number ${course_number}`
      + ` section_number ${section_number}`)
    next(error)
  }
});

function getMailOptions(email, subject, body) {
  return {
   from: 'vie.do.not.reply@gmail.com',
   to: email,
   subject: subject,
   html: body
  }
}

function getEmailSubject(course_name, section_number) {
  const email_subject = `ViE - ${course_name}`
    + ` Section ${section_number} Course Invite`
  return email_subject
}

function getEmailBody(instructor_name, course_name,
  course_subject_code, course_number, section_number, join_code) {
  const email_body = `<p>${instructor_name} invited you to join their course`
    + ` <strong>${course_name} (${course_subject_code} ${course_number}) `
    + ` Section ${section_number}.</strong>`
    + `<br/><br/>`
    + `To join, follow the steps below:`
    + `<br/><br/>`
    + `1) Go to viengage.com<br/>`
    + `2) Log in if you already have an account, sign up if you don't<br/>`
    + `3) Once you are logged in, click 'Join Course' and paste the code: `
    + `${join_code}`
    + `<br/><br/>`
    + `--<br/>`
    + `ViE - Increase Virtual Engagement</p>`
  return email_body
}

module.exports = emailRoutes;
