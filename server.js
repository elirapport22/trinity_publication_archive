const express = require('express');
const fs = require('fs');
const ejs = require('ejs');
const methodOverride = require('method-override');

//Creating an Object.
const app = express();

//Parsing JSON, encoding URLS, accessing assets, and specifying things.
app.use(express.json()); //Used to parse JSON bodies (needed for POST requests)
app.use(express.urlencoded());


app.use(methodOverride('_method'));//middleware for CRUD:UPDATE and DELETE
app.use(express.static('public')); //specify location of static assests
app.set('views', __dirname + '/views'); //specify location of templates
app.set('view engine', 'ejs'); //specify templating library,



app.use(require('./controllers/auth'));
app.use(require('./controllers/index'));
app.use(require('./controllers/admin_controller'));
app.use(require('./controllers/publications_controller'));
app.use(require('./controllers/student_leader_controller'));
//app.use(require('./controllers/user_controller'));


app.use("", function(request, response) {
  response.redirect('/error?code=400');
});

//Start server.
const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Server started at http://localhost:' + port + '.')
});
