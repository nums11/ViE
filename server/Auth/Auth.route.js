const express = require('express');
const authRoutes = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const _ = require('lodash')

const APIServerBaseURL = () => {
  if (process.env.NODE_ENV === 'production') return `https://venue-attend.herokuapp.com/`
  // Try to connect desktop IP
  if (process.env.SOURCE_IP) return `http://${process.env.SOURCE_IP}:4000/`
  return `http://localhost:4000/`
}


const FrontEndServerBaseURL = () => {
  if (process.env.NODE_ENV === 'production') return `https://venue-attend.herokuapp.com/`
  // Try to connect desktop IP
  if (process.env.SOURCE_IP) return `http://${process.env.SOURCE_IP}:8080/`
  return `http://localhost:8080/`
}

let User = require('../User/User.model');

const alnums = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

async function generateSID() {
  let venueSID = ""
  for (let i = 1000; i > 0; --i) {
    venueSID += alnums[Math.floor(Math.random() * alnums.length)];
  }
  let user = await User.findOne({connect_sid: venueSID})
  if (!user) {
    return venueSID
  } else {
    return null
  }
}

//Passport setup START
const passport = require('passport')
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});
if(process.env.NODE_ENV === "production") {
  passport.use(new (require('passport-cas').Strategy)({
    version: 'CAS3.0',
    ssoBaseURL: 'https://cas-auth.rpi.edu/cas',
    serverBaseURL: 'https://byakugan.herokuapp.com'
  }, function(profile, done) {
    var login = profile.user.toLowerCase();
    User.findOne({user_id: login}, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, {message: 'Unknown user'});
      }
      user.attributes = profile.attributes;
      return done(null, user);
    });
  }));
} else {
  passport.use(new (require('passport-cas').Strategy)({
    version: 'CAS3.0',
    ssoBaseURL: 'https://cas-auth.rpi.edu/cas',
    serverBaseURL: APIServerBaseURL()
  }, function(profile, done) {
    var login = profile.user.toLowerCase();
    User.findOne({user_id: login}, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, {message: 'Unknown user'});
      }
      user.attributes = profile.attributes;
      return done(null, user);
    });
  }));
}
//Passport setup END

authRoutes.route('/signup').post(function (req, res) {
  let user = new User(req.body.user)
  user.save()
    .then(() => {
      const token = jwt.sign({ user }, process.env.AUTH_KEY)
      res.status(200).json({token, user});
    })
    .catch(() => {
      res.status(400).send("unable to save user to database");
    });
});

authRoutes.route('/login').post(function (req, res) {
  let user = req.body.user
  if(user){
    User.findOne({ '$or': [{ user_id: user.user_id }, { email: user.user_id }] }, function(error, current_user) {
      if(error || !current_user){
        console.log("Error unable to find user: " + user)
        res.status(404).json({ error: 'Invalid Login Credentials. Please try again' })
      }
      else {
        console.log(current_user)
        bcrypt.compare(user.password, current_user.password, function(err, result) {
          if(result == true){
            const token = jwt.sign({ current_user }, process.env.AUTH_KEY)
            res.json({token, current_user})
          } else {
            res.status(404).json({ error: 'Invalid Login Credentials. Please try again' })
          }
        });
      }
    })
  }else{
    res.status(400).json({ error: 'Invalid login. Please try again.' })
  }
});

authRoutes.route('/silent_login').post(function (req, res) {
  let user = req.body.user
  if(user){
    User.findOne({ _id: user._id }, function(error, current_user) {
      if(error || !current_user){
        console.log("Error unable to find user: " + user)
        res.status(404).json({ error: 'Invalid Login Credentials. Please try again' })
      }
      else {
        console.log(current_user)
        bcrypt.compare(user.password, current_user.password, function(err, result) {
          if(result == true){
            const token = jwt.sign({ current_user }, process.env.AUTH_KEY)
            res.json({token, current_user})
          } else {
            res.status(404).json({ error: 'Invalid Login Credentials. Please try again' })
          }
        });
      }
    })
  }else{
    res.status(400).json({ error: 'Invalid login. Please try again.' })
  }
});

authRoutes.route('/check_for_temp_user/:user_id/:temp_password').get(function (req, res) {
  let user_id = req.params.user_id
  let temp_password = req.params.temp_password
  console.log("user_id",user_id,"temp_password",temp_password)
  if(user_id && temp_password){
    User.findOne({ user_id: user_id, temp_password: temp_password}, function(error, temp_user) {
      if(error || !temp_user){
        console.log("Error unable to find temp user with user_id", user_id, "and temp password", temp_password)
        res.status(404).json({ error: 'Invalid Login Credentials. Please try again' })
      } else {
        console.log("<Success>: Found temp user")
        res.json(temp_user)
      }
    })
  }else{
    res.status(400).json({ error: 'Invalid login. Please try again.' })
  }
});

authRoutes.route('/set_permanent_pasword').post(function (req, res) {
  let user = req.body.user
  if(user){
    bcrypt.hash(user.password, saltRounds, (err, hash) => {
      if(err || hash == null) {
        console.log("<ERROR> Hashing password for user:",user)
        res.json(err)
      } else {
        User.findByIdAndUpdate(user._id, {
          password: hash,
          temp_password: null
        },
        (error, updated_user) => {
          if(error || updated_user == null) {
            console.log("<ERROR> Setting password for user:",user)
            res.json(err)
          } else {
            console.log("<Success> Setting password for user:",updated_user)
            const token = jwt.sign({ updated_user }, process.env.AUTH_KEY)
            let current_user = updated_user
            res.json({token, current_user})
          }
        })
      }
    });
  }else{
    res.status(400).json({ error: 'Invalid user. Please try again.' })
  }
});

authRoutes.get("/loginCAS", (req, res, next) => {
  passport.authenticate('cas', function (err, user, info) {
    if (err) {
      return next(err);
    } else if (!user) {
      req.session.messages = info.message;
      if(process.env.NODE_ENV === "production") {
        return res.redirect('https://byakugan.herokuapp.com');
      } else {
        return res.redirect(FrontEndServerBaseURL());
      }
    } else {
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        } else {
          req.session.messages = '';
          let venueSID = generateSID()
          Promise.resolve(venueSID).then(resolvedSID => {
            if(resolvedSID != null) {
              User.findOneAndUpdate({user_id: user.user_id},{connect_sid: resolvedSID},function(err,user) {
                if(err || user == null) {
                  return next(err);
                } else {
                  res.header("Set-Cookie","connect_sid="+resolvedSID)
                  if(process.env.NODE_ENV === "production") {
                    return res.redirect('https://byakugan.herokuapp.com/#/redirectCASLogin');
                  } else {
                    console.log("I entered here. using url", FrontEndServerBaseURL())
                    return res.redirect(`${FrontEndServerBaseURL()}/#/redirectCASLogin`);
                  }
                }
              })
              return res.redirect(FrontEndServerBaseURL());
            }
          })
        }
      });
    }
  })(req, res, next);
});

authRoutes.get("/loginStatus", function(req, res) {
  User.findOne({connect_sid: req.cookies["connect_sid"]}, function (err, current_user) {
    if(err || current_user == null) {
      res.json(null)
    } else {
      const token = jwt.sign({current_user}, process.env.AUTH_KEY)
      res.json({token, current_user})
    }
  });
});

authRoutes.get("/logoutCAS", function(req, res) {
  res.header("Set-Cookie","connect_sid="+";expires=Thu, 01 Jan 1970 00:00:00 GMT")
  res.send()
});

authRoutes.route('/set_password/:user_id').post((req, res) => {
  let new_password = req.body.password
  let user_id = req.params.user_id
  let confirm_key = req.body.confirm_key

  if (!new_password) {
    console.log(`<USER/Change Pass: Error> No new password found`)
    res.json({
      success: false,
      error: `No new password found`
    })
    return;
  }

  if (!confirm_key) {
    console.log(`<USER/Change Pass: Error> No confirm key found`)
    res.json({
      success: false,
      error: `No confirm key found`
    })
    return;
  }

  if (!user_id) {
    console.log(`<USER/Change Pass: Error> No user id found`)
    res.json({
      success: false,
      error: `No user id found`
    })
    return;
  }

  User.findById(user_id, (err, user_doc) => {

    if (err || !user_doc) {
      res.json({
        success: false,
        error: `No user id found for id ${user_id}`
      })
    }
    else {

      if (_.has(user_doc.toObject(), 'password')) {
        console.error(`<USER/Change Password: Error> User already has a password`)
        res.json({
          success: false,
          error: `User already has a password`
        })
      }

      else if (!_.has(user_doc.toObject(), 'confirm_key')) {
        console.error(`<USER/Change Password: Error> User has no confirm key`)
        res.json({
          success: false,
          error: `User has no confirm key`
        })
      }

      else if (user_doc.confirm_key == confirm_key) {

        bcrypt.hash(new_password, saltRounds, async (err, hash) => {
          if (err || hash == null) {
            console.log(`<USER/Change Password: Error> Filed to hash password`)
            res.json(err)
          }
          else {

            // get rid of the confirm key and save the password
            user_doc.password = hash
            user_doc.confirm_key = undefined
            await user_doc.save ()
  
            console.log(`<User/Change Pass> Successfully changed password!`)
            res.json({
              success: true
            })
          }
        })
      }

      else {
        console.error(`<USER/>Confirm Key: Error> Confirm key does not match`)
        res.json({
          success: false,
          error: `Invalid confirm key`
        })
      }
    }
  })

})

module.exports = authRoutes;