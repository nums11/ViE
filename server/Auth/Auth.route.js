const express = require('express');
const authRoutes = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const UserHelper = require('../helpers/user_helper')
const User = require('../User/User.model');
const Section = require('../Section/Section.model');
const passport = require('passport')

const alnums = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const base_url = getBaseURL()

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

// Set up passport for CAS Auth
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});
passport.use(new (require('passport-cas').Strategy)({
  version: 'CAS3.0',
  ssoBaseURL: 'https://cas-auth.rpi.edu/cas',
  serverBaseURL: getServerBaseURL()
}, function(profile, done) {
  console.log("")
  const login = profile.user.toLowerCase();
  User.findOne({user_id: login, is_rpi_member: true},
    function (err, user) {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false, {user_id: login});
    }
    user.attributes = profile.attributes;
    return done(null, user, {user_id: login});
  });
}));

authRoutes.route('/onboard_user')
.post(async function (req, res, next) {
  const user = req.body.user

  if(!user.is_rpi_member)
    user.password = bcrypt.hashSync(user.password, saltRounds)
  const new_user = new User(req.body.user);

  try {
    const saved_user = await new_user.save()
    res.json(saved_user)
  } catch(error) {
    next(error)
  }
});

authRoutes.route('/login').post(function (req, res) {
  let user = req.body.user
  User.findOne({ user_id: user.user_id, is_rpi_member: false}, function(error, current_user) {
    if(error || !current_user){
      console.log("Error unable to find user: " + user)
      res.status(404).json({ error: 'Invalid Login Credentials. Please try again' })
    }
    else {
      bcrypt.compare(user.password, current_user.password, function(err, result) {
        if(result == true){
          const token = jwt.sign(current_user.user_id + current_user.last_name +
            current_user.first_name, process.env.AUTH_KEY)
          console.log("<SUCCESS> (auth/login)")
          res.json({token, current_user})
        } else {
          res.status(404).json({ error: 'Invalid Login Credentials. Please try again' })
        }
      });
    }
  })
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

authRoutes.get("/loginCAS-:optional_meeting_id-:optional_code-:first_login", (req, res, next) => {
  let optional_meeting_id = req.params.optional_meeting_id
  let optional_code = req.params.optional_code
  let first_login = req.params.first_login
  passport.authenticate('cas', function (err, user, info) {
    if (err) {
      console.log("<ERROR> (auth/loginCAS) authenticating", err)
      return next(err);
    } else if (!user) {
      res.redirect(`${base_url}/login/true`)
    } else {
      req.logIn(user, function (err) {
        if (err) {
          console.log("<ERROR> (auth/loginCAS) logging in", err)
          return next(err);
        } else {
          req.session.messages = '';
          let venueSID = generateSID()
          Promise.resolve(venueSID).then(resolvedSID => {
            if(resolvedSID != null) {
              User.findOneAndUpdate({user_id: user.user_id},{connect_sid: resolvedSID},{new:true},function(err,user) {
                if(err || user == null) {
                  console.log("<ERROR> (auth/loginCAS) updating user by id", user.user_id,
                    err)
                  return next(err);
                } else {
                  res.header("Set-Cookie","connect_sid="+resolvedSID)
                  console.log("<SUCCESS> (auth/loginCAS) updating user and setting cookie.")
                  res.redirect(`${base_url}/redirectCASLogin/${optional_meeting_id}/${optional_code}/${first_login}`)
                }
              })
            } else {
              console.log("<ERROR> (auth/loginCAS) resolving SID", resolvedSID)
              return res.redirect('http://localhost:8080');
            }
          })
        }
      });
    }
  })(req, res, next);
});

authRoutes.get("/signup_redirect", (req, res, next) => {
  passport.authenticate('cas', function (err, user, info) {
    if (err) {
      console.log("<ERROR> (auth/signup) authenticating", err)
      next(err);
    } else if (user) {
      // User Exists - will show error on the frontend
      res.redirect(`${base_url}/signup/true`)
    } else {
      // User does not exists - redirect to the create_user route
      const user_id = info.user_id
      res.redirect(`${base_url}/create_user/${user_id}`)
    }
  })(req, res, next);
});

authRoutes.get("/loginStatus", function(req, res) {
  User.findOne({connect_sid: req.cookies["connect_sid"]}, function (err, current_user) {
    if(err || current_user == null) {
      console.log("<ERROR> (auth/loginStatus) Finding user with connect_sid",
        req.cookies["connect_sid"], err)
      res.json(null)
    } else {
      const token = jwt.sign(current_user.user_id + current_user.last_name +
        current_user.first_name, process.env.AUTH_KEY)
      console.log("<SUCCESS> (auth/loginStatus) Finding user by connect_sid.")
      res.json({token, current_user})
    }
  });
});

authRoutes.get("/logoutCAS", function(req, res) {
  res.header("Set-Cookie","connect_sid="+";expires=Thu, 01 Jan 1970 00:00:00 GMT")
  res.send()
});

authRoutes.post('/record_auth_header_update', function (req, res) {
  let user_id = req.body.user_id
  User.findOneAndUpdate(
    {user_id: user_id},
    {updated_auth_header: true},
    {new: true},
    (error, user) => {
      if(error || user == null) {
        console.log("<ERROR> (auth/record_auth_header_update) updating user with updated_auth_header.")
        res.status(500).json(error)
      } else {
        console.log("<SUCCESS> (auth/record_auth_header_update) updated user with updated_auth_header.",
          user.updated_auth_header)
        res.json(user)
      }
    })
});

authRoutes.get('/user_with_updated_auth_headers', function (req, res) {
  User.find({updated_auth_header: true},
    (error, users) => {
      if(error || users == null) {
        console.log("<ERROR> (auth/user_with_updated_auth_headers) getting users with updated_auth_headers.")
        res.status(500).json(error)
      } else {
        console.log("<SUCCESS> (auth/user_with_updated_auth_headers) getting user with updated_auth_headers.")
        res.json(users)
      }
    })
});

authRoutes.get('/non_rpi_user_ids_and_emails', function (req, res, next) {
  User.find({is_rpi_member: false},function(err, non_rpi_users){
    if(err) {
      next(error)
    } else {
      let non_rpi_user_ids = []
      let non_rpi_emails = []
      non_rpi_users.forEach(user => {
        non_rpi_user_ids.push(user.user_id)
        non_rpi_emails.push(user.email)
      })
      console.log("<SUCCESS> (auth/non_rpi_user_ids_and_emails)")
      res.json({
        user_ids: non_rpi_user_ids,
        emails: non_rpi_emails
      });
    }
  });
});

authRoutes.post('/update_password/:email', (req, res, next) => {
  const email = req.params.email
  const new_password = req.body.new_password

  User.find({is_rpi_member: false, email: email},
    async function(error, users){
    if(error) {
      next(error)
    } else if(users.length === 0) {
      console.log(`<ERROR> (users/update_password) could not find user`
        + ` with email ${email}`)
      res.status(404).json("Could not find user")
    } else {
      let user = users[0]
      user.password = bcrypt.hashSync(new_password, saltRounds)
      const saved_user = await user.save()
      console.log("<SUCCESS> (auth/update_password)")
      res.json(saved_user);
    }
  })
})


function getBaseURL() {
  if(process.env.NODE_ENV === "production")
    return "https://viengage.com/#"
  else
    return "http://localhost:8080/#"
}

function getServerBaseURL() {
  if(process.env.NODE_ENV === "production")
    return "https://viengage.com"
  else
    return "http://localhost:4000"
}
module.exports = authRoutes;