const express = require('express');
const expbhs = require('express-handlebars');
const app = express();
app.engine('handlebars',expbhs({defaultLayout: 'main'}));

app.set('view engine', 'handlebars');
const port = 3000;

app.get('/',(req,res)=>{
    res.render('home')});

app.get('/about',(req,res)=>{
    res.send('About');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});