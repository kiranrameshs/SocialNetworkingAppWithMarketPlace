// Load modules
const express = require('express');
const Handlebars = require('handlebars')
const expbhs = require('express-handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');


// Connect to MongoURI exported from config
const keys = require('./config/keys');
const User = require('./models/user');


require('./passport/google-passport');
// Initialize application
const app = express();

app.use(cookieParser());
app.use(bodyParser());
app.use(session({ secret: 'keyboard cat',
resave: true,
saveUninitialized: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

//Global variables for User
app.use( (req,res,next) => {
  res.locals.user = req.user || null;
  next();
});


// Template engine for view 
app.engine('handlebars',expbhs({defaultLayout: 'main',
handlebars: allowInsecurePrototypeAccess(Handlebars)}));
app.set('view engine', 'handlebars');

// Setup static files to store css, js, images
app.use(express.static('public'));

mongoose.Promise = global.Promise;

//connect to remote db using keys imported above
mongoose.connect(keys.MongoURI, {useNewUrlParser: true})
.then(() => {console.log('Connected to remote db successfully')}).catch(() =>
{console.log(err)});



// server port set as env variable and for local port as 3000
const port = process.env.PORT || 4000;


// route for pages
app.get('/',(req,res)=>{
    res.render('home')});

app.get('/about',(req,res)=>{
    res.render('about');
});

//Google Auth route
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/profile');
  });

  app.get('/profile',(req,res)=>{
    User.findById({_id: req.user._id}).then
    ((user) => {
      res.render('profile', {user:user});
    })
});

//Handle user logout
app.get('/logout', (req, res) =>
{
  req.logOut();
  res.redirect('/');
})
    
//success message if server is running
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});