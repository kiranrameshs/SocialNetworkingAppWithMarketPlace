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

//Collections
const User = require('./models/user');
const Post = require('./models/post');


require('./passport/google-passport');
require('./passport/facebook-passport');

//Link helpers
const {ensureAuthentication,ensureGuest} = require('./helpers/auth');

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
app.get('/',ensureGuest, (req,res)=>{
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

  //Handle all users route
  app.get('/users',ensureAuthentication,(req,res)=>{
    User.find({}).then((users) =>{
      res.render('users', 
      {users:users})
    })
});

  //Display one user profile route
  app.get('/user/:id',ensureAuthentication,(req,res)=>{
    User.findById({_id: req.params.id}).then((user) =>{
      res.render('user', 
      {user:user})
    })
});

  //Handle profile route
  app.get('/profile',ensureAuthentication,(req,res)=>{
    User.findById({_id: req.user._id}).then
    ((user) => {
      res.render('profile', {user:user});
    })
});

//Handle add email post route
app.post('/addEmail',(req, res) =>{
  const email = req.body.email;
  User.findById({_id: req.user._id})
  .then((user) =>
  {
    user.email = email;
    user.save()
    .then(() =>{
      res.redirect('/profile');
    })
  })
})

//Handle add Phone number route
app.post('/addPhone', (req, res) => {
  const phoneNumber = req.body.phone;
  User.findById({_id: req.user._id})
  .then((user) =>
  {
    user.phoneNumber = phoneNumber;
    user.save()
    .then(() =>{
      res.redirect('/profile');
    })
  })
})

//Handle add location route
app.post('/addLocation', (req, res) => {
  const location = req.body.location;
  User.findById({_id: req.user._id})
  .then((user) =>
  {
    user.location = location;
    user.save()
    .then(() =>{
      res.redirect('/profile');
    })
  })
})


//Handle add post route
app.post('/savePost',(req, res) =>{
  
  var allowComments; 

  if(req.body.allowComments){
    allowComments = true
  }
  else{
    allowComments = false
  }

  const newPost = {
    title: req.body.title,
    body: req.body.body, 
    allowComments:allowComments,
    status: req.body.status,
    user: req.user._id
  }
  new Post(newPost).save().then(()=>
  {
    res.redirect('/posts');
  });
});

//handle all posts route
app.get('/posts',ensureAuthentication,(req,res)=>{
    Post.find({status: 'public'})
    .populate('user')
    .sort({date: 'desc'}).then((posts)=>{
      res.render('publicposts', {posts:posts});
    });
  });




//Facebook Auth route
app.get('/auth/facebook',
  passport.authenticate('facebook',{
    scope: 'email'
  }));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/profile');
  });

//Handle posts route
app.get('/addpost', (req, res) =>
{
  res.render('addpost');
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