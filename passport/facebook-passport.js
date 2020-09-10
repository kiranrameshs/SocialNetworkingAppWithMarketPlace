const passport =  require('passport');
const keys = require('../config/keys-dev');
const User = require('../models/user');
const FacebookStrategy = require('passport-facebook').Strategy;


passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use(new FacebookStrategy({
    clientID: keys.FacebookClientID,
    clientSecret: keys.FacebookClientSecret,
    callbackURL: "/auth/facebook/callback", 
    proxy: true,
    profileFields: ['id','displayName', 'name', 'photos', 'email']
  },
  (accessToken, refreshToken, profile, done) => {
    // User.findOrCreate({ facebookId: profile.id }, function (err, user) {
    //   return cb(err, user);
    console.log(profile);
    User.findOne({
        facebook: profile.id
    }).then((user) =>
    { if (user){
        done(null, user)
    }
    else{
        const newUser = {
            facebook: profile.id,
            fullName : profile.displayName,
            lastname : profile.name.familyName,
            firstname : profile.name.givenName,
            image: `https://graph.facebook.com/${profile.id}/picture?type=large`
        }
        new User(newUser).save()
        .then((user)=>{
            done(null,user);
        })
    }

    } )
  }
));