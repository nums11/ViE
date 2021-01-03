const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path')
const mongoose = require('mongoose');
const config = require('./DB.js');
const jwt = require('jsonwebtoken');
const serveStatic = require('serve-static');
const LOCAL_PORT = 4000;
const passport = require('passport')
const session = require('express-session')
var cookieParser = require('cookie-parser');
const RealTimeAttendanceQueue = require('./socket/RealTimeAttendanceQueue')
const NotificationJob = require('./Notification/NotificationJob.model');
const schedule = require('node-schedule');
const nodemailer = require("nodemailer");

// For Concurrency
const throng = require('throng')
var WORKERS = process.env.WEB_CONCURRENCY || 1;

throng({
  workers: WORKERS,
  lifetime: Infinity // respawn dead workers
}, start);

function start() {

  let attendanceSocketQueue = new RealTimeAttendanceQueue ()

  function jwtVerify(req,res,next) {
    const bearerHeader = req.headers['authorization']
    if (typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ')
      const bearerToken = bearer[1]
      req.token = bearerToken
      jwt.verify(req.token, process.env.AUTH_KEY, err => {
        if(err)
          res.sendStatus(401).send("Unauthorized access")
        else
          next()
      })
    } else {
      res.sendStatus(401)
    }
  }

  // get environment variabless when not in production
  if (process.env.NODE_ENV !== 'production')
    require('dotenv').config({ path: path.resolve(__dirname, '../variables.env') })

  // ensure auth key is available in environment
  if(!process.env.AUTH_KEY){
    console.log("No auth key")
    process.exit(1);
  }

  const authRouter = require('./Auth/Auth.route')
  const userRouter = require('./User/User.route')
  const courseRouter = require('./Course/Course.route')
  const sectionRouter = require('./Section/Section.route')
  const meetingRouter = require('./Meeting/Meeting.route')
  const submissionRouter = require('./Submission/Submission.route')
  const videoRouter = require('./Video/Video.route')
  const qrScanRouter = require('./QRScan/QRScan.route')
  const notificationRouter = require('./Notification/Notification.route')
  const AttendanceFinder = require('./socket/AttendanceFinder')

  let io;

  // Connect to the database before starting the application server.
  mongoose.connect(process.env.DB_URI || config.DB, function (err, client) {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    console.log("Database connection ready");
    // Initialize the app.
    var server = app.listen(process.env.PORT || LOCAL_PORT, function () {
      server.headersTimeout = 0;
      var port = server.address().port;
      console.log("App is now running on port", port);
      io = require('socket.io')(server);
      io.on('connection', (socket) => {
        socket.on('startRealTimeQRScanUpdate', (qr_scan_id) => {
          console.log("Starting real-time attendance update for qr scan",
            qr_scan_id)
        })
        // socket.on('disconnect', () => {
        //     attendanceSocketQueue.removeFromQueue(socket.id)
        // });

          // Handle attendance real time updates through websocket
          // socket.on('start attendance update', (task_info) => {
          //   console.log(`Attendance update initialized`)

          //   console.log(attendanceSocketQueue.getQueue())
          //   if (attendanceSocketQueue.addToQueue(socket.id, task_info.task_id)) {
          //     console.log(`<SOCKETIO/start attendance update> Successfully added socket ${socket.id} to queue.`)
          //     console.log(attendanceSocketQueue.getQueue())
          //   }
          //   else {
          //     console.log(`<SOCKETIO/start attendance update> Problem occurred while adding socket to queue.`)
          //   }
          // })
      })
      // Forces a page refresh for all users so they can be on the updated version of the app
      if (process.env.NODE_ENV === 'production'){
        setTimeout(function() {
          console.log("Emitting server update")
          io.emit('server-update')
        }, 30000)
      }
    });
  });

  const origin_url = process.env.NODE_ENV === 'production' ?
  'https://venue-attend.herokuapp.com' : 'http://localhost:8080'
  app.use(cors({
    origin: origin_url,
    methods:['GET','POST','DELETE','PUT'],
    credentials:true, 
  }))
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // Serve front end build on static server
  var distDir = __dirname + "/../dist/";
  app.use(express.static(distDir));

  app.use(cookieParser());
  app.use(session({
    secret: 'stackoverflow_didnt_even_help',
    cookie: {
      maxAge: 24 * 60 * 60 * 1000
    },
    resave: false,
    saveUninitialized: true
  }))

  app.use(passport.initialize());
  app.use(passport.session());

  // middleware for attendance tracker
  app.use((req, res, next) => {
    req.socketQueue = attendanceSocketQueue
    req.socketIO = io
    next()
  })

  app.use('/users', jwtVerify, userRouter);
  app.use('/courses', jwtVerify, courseRouter);
  app.use('/sections', jwtVerify, sectionRouter);
  app.use('/meetings', jwtVerify, meetingRouter);
  app.use('/submissions', submissionRouter);
  app.use('/auth', authRouter);
  app.use('/videos', videoRouter);
  app.use('/qrcheckins', qrScanRouter);
  app.use('/notifications', notificationRouter);

  rescheduleAllNotificationJobs()
}

function rescheduleAllNotificationJobs() {
  global.all_notification_jobs = []
  // Reschedule all notification jobs on server start
  NotificationJob.find(async (error, notification_jobs) => {
    if(error || notification_jobs == null) {
      console.log("<ERROR> getting all notifications")
    } else {
      let notification_job_promises = []
      notification_jobs.forEach(notification_job => {
        console.log(`Rescheduling job for ${new Date(notification_job.scheduled_time)}`)
        let job = schedule.scheduleJob(notification_job.scheduled_time, function(){
          notification_job.sendScheduledShowQRNotificationsToInstructors()
          NotificationJob.findByIdAndRemove(notification_job._id, (error) => {
            if (error) {
              console.log("<ERROR> Deleting NotificationJob with ID:",
                saved_notification_job._id, error)
            } else {
              console.log("<SUCCESS> Deleting NotificationJob")
            }
          });
        });
        all_notification_jobs.push(job)
        let global_index = all_notification_jobs.length - 1
        if(notification_job.global_index != global_index) {
          notification_job_promises.push(new Promise((resolve, reject) => {
            NotificationJob.findByIdAndUpdate(notification_job._id,
              {global_index: global_index},
              (error, notification_job) => {
                if(error || notification_job == null) {
                  console.log("<ERROR> Updating NotificationJob global_index",
                    notification_job._id, error)
                  reject(notification_job)
                } else {
                  resolve(notification_job)
                }
              }
            )
          }))
        }
      })
      try {
        const resolved_jobs = await Promise.all(notification_job_promises)
        console.log(`<SUCCESS> updated ${resolved_jobs.length} jobs with new global_index`)
      } catch(error) {
        console.log("<ERROR> updating notification jobs with new global index")
      }
    }
  })
}