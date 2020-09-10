const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('../config/keys');
const User = require('../models/user');

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID: keys.GoogleClientID,
    clientSecret: keys.GoogleSecret,
    callbackURL: "/auth/google/callback",
    proxy: true
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    User.findOne({
        google: profile.id
    }).then((user) =>
    {
        if(user){
            done(null, user);
        }
        else{
            const newUser = {
                google: profile.id,
                fullName : profile.displayName,
                lastname : profile.name.familyName,
                firstname : profile.name.givenName,
                image: profile.photos[0].value
            }
            //save new user info into database
            new User(newUser).save()
            .then((user) => {
                done(null, user);
            })
        }
    })
  }
));