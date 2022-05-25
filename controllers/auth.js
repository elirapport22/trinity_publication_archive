const express = require('express'),
  router = express.Router();
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const KEYS = require('../config/keys.json');

let userProfile;

const User = require('../models/user_model');

router.use(session({
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 600000 //600 seconds of login time before being logged out
  },
  secret: KEYS["session-secret"]
}));
router.use(passport.initialize());
router.use(passport.session());
router.use((req, res, next) => {
  if(req.user){
  req.this_user = User.getUser(req.user._json.email);
  req.this_user.name = req.user._json.email;
  console.log(req.this_user)
  }
  next()
})

passport.use(new GoogleStrategy({
    clientID: KEYS["google-client-id"],
    clientSecret: KEYS["google-client-secret"],

    callbackURL: "http://localhost:3000/auth/google/callback"
     //callbackURL: "https://pumpkin-pie-30391.herokuapp.com/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    userProfile = profile; //so we can see & use details form the profile
    return done(null, userProfile);
  }
));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});
passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

/*
  This triggers the communication with Google
*/
router.get('/auth/google',
  passport.authenticate('google', {
    scope: ['email']
  }));

/*
  This callback is invoked after Google decides on the login results
*/
router.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/error?code=401'
  }),
  function(request, response) {
    let userID = request.user._json.email;
    User.createUser(userID, userID.split('.')[0]);
    response.redirect('/');
  });

router.get("/auth/logout", (request, response) => {
  request.logout();


  response.redirect('/');
});

module.exports = router;
