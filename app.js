// Load modules
const express = require('express');
const expbhs = require('express-handlebars');
const mongoose = require('mongoose');

// Connect to MongoURI exported from config
const keys = require('./config/keys');

// Initialize application
const app = express();

// Template engine for view 
app.engine('handlebars',expbhs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Setup static files to store css, js, images
app.use(express.static('public'));

//connect to remote db using keys imported above
mongoose.connect(keys.MongoURI, {useNewUrlParser: true})
.then(() => {console.log('Connected to remote db successfully')}).catch(() =>
{console.log(err)});

// server port set as env variable and for local port as 3000
const port = process.env.PORT || 3000;


// route for pages
app.get('/',(req,res)=>{
    res.render('home')});

app.get('/about',(req,res)=>{
    res.render('about');
});

//success message if server is running
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});