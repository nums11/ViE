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
const Submission = require('./Submission/Submission.model');
const SubmissionHelper = require('./helpers/submission_helper');
const NotificationHelper = require('./helpers/notification_helper');
const QRSocketHelper = require('./helpers/qr_socket_helper');
const RealTimeQuizSocketHelper
  = require('./helpers/real_time_quiz_socket_helper');
const QRScan = require('./QRScan/QRScan.model');
const nodemailer = require("nodemailer");

// For Concurrency
const throng = require('throng')
var WORKERS = process.env.WEB_CONCURRENCY || 1;

throng({
  workers: WORKERS,
  lifetime: Infinity // respawn dead workers
}, start);

function start() {

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
  const asyncPortionRouter = require('./AsyncPortion/AsyncPortion.route')
  const realTimePortionRouter =
    require('./RealTimePortion/RealTimePortion.route')
  const emailRouter = require('./Email/Email.route')
  const quizRouter = require('./Quiz/Quiz.route')
  const globalCommandRouter = require('./GlobalCommands.route')

  let io;

  // Connect to the database before starting the application server.
  mongoose.connect(process.env.DB_URI || config.DB, function (err, client) {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    console.log("Database connection ready");
    var server = app.listen(process.env.PORT || LOCAL_PORT, function () {
      server.headersTimeout = 0;
      var port = server.address().port;
      console.log("App is now running on port", port);
      // Map between qr_scan ids and the instructor socket ids
      const real_time_qr_scan_ids = new Map()
      // Map between quiz ids and an object containg the instructor
      // socket id, current question id, and an array of student socket ids
      const real_time_quiz_ids = new Map()
      io = require('socket.io')(server);
      io.on('connection', (socket) => {
        QRSocketHelper.handleQRSocketEvents(io, socket, real_time_qr_scan_ids)
        RealTimeQuizSocketHelper.handleRealTimeQuizSocketEvents(io, socket,
          real_time_quiz_ids)
      })
      // Forces a page refresh for all users so they can
      // be on the updated version of the app
      if (process.env.NODE_ENV === 'production'){
        setTimeout(function() {
          console.log("Emitting server update")
          io.emit('server-update')
        }, 30000)
      }
    });
  });

  const origin_url = process.env.NODE_ENV === 'production' ?
  'https://viengage.com' : 'http://localhost:8080'
  // Force all requests to go through https
  if(process.env.NODE_ENV === 'production') {
    app.get('*',function(req,res,next){
      if(req.headers['x-forwarded-proto']!='https')
        res.redirect('https://viengage.com'+req.url)
      else
        next()
    })
  }
  
  // For connecting to localhost from mobile
  // app.use(cors({
  //   origin: [origin_url, 'http://192.168.1.122:8080',
  //   'http://192.168.1.118:8080'],
  //   methods:['GET','POST','DELETE','PUT'],
  //   credentials:true, 
  // }))

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
  app.use('/users', jwtVerify, userRouter);
  app.use('/courses', jwtVerify, courseRouter);
  app.use('/sections', jwtVerify, sectionRouter);
  app.use('/meetings', jwtVerify, meetingRouter);
  app.use('/submissions', submissionRouter);
  app.use('/auth', authRouter);
  app.use('/videos', videoRouter);
  app.use('/notifications', notificationRouter);
  app.use('/async_portions', asyncPortionRouter);
  app.use('/real_time_portions', realTimePortionRouter);
  app.use('/qr_scans', qrScanRouter);
  app.use('/emails', emailRouter);
  app.use('/quizzes', quizRouter)
  app.use('/global_commands', globalCommandRouter)

  NotificationHelper.rescheduleAllNotificationJobs()
}