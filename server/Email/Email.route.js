const express = require('express');
const emailRoutes = express.Router();
const nodemailer = require("nodemailer");

emailRoutes.route('/invite').post(
  async function (req, res, next) {
  const course_name = req.body.course_name
  const course_subject_code = req.body.course_subject_code
  const course_number = req.body.course_number
  const section_number = req.body.section_number
  const instructor_name = req.body.instructor_name
  const join_code = req.body.join_code
  const student_emails = req.body.student_emails
  const transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
     user: 'vie.do.not.reply@gmail.com',
     pass: process.env.EMAIL_PASS
   }
  });
  const subject = getEmailSubject(course_name, section_number)
  const body = getEmailBody(instructor_name, course_name,
    course_subject_code, course_number, section_number, join_code)
  try {
    let mail_promises = []
    student_emails.forEach(student_email => {
      mail_promises.push(new Promise((resolve,reject) => {
        const mail_options = getMailOptions(student_email,
          subject, body)
        transporter.sendMail(mail_options, function(error, info){
          if (error) {
            console.log("<ERROR> sending mail", error);
            reject(student_email)
          } else {
            resolve(student_email)
          }
        });
      }))
    })
    const email_statuses = await Promise.allSettled(mail_promises)
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
  console.log("Email", email)

  const transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
     user: 'vie.do.not.reply@gmail.com',
     pass: process.env.EMAIL_PASS
   }
  });
  const subject = "ViE - Reset Your Password"
  const body = "Someone requested a password reset for your "
    + "account. If this was not you, please contact viengagecontact@gmail.com "
    + "so we can take the proper security measures.<br/><br/> "
    + "Follow this link to reset your password: "
    + `https://viengage.com/reset_password/${email}`

  try {
    const mail_options = getMailOptions(email,
      subject, body)
    const mail_promise = new Promise((resolve, reject) => {
      transporter.sendMail(mail_options, function(error, info){
        if (error) {
          console.log("<ERROR> sending mail", error);
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
