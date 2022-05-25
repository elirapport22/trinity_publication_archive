const express = require('express');
const multer = require('multer');
const fs = require('fs');
const ejs = require('ejs');
const methodOverride = require('method-override');


//Creating an Object.
const app = express();

let server = require('http').Server(app);
let io = require('socket.io')(server);
let File = require('./models/file_model')

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
//app.use(require('./controllers/socketConnections'));

// SET STORAGE
let privateStorage = multer.diskStorage({
  destination: function (request, file, cb) {
    cb(null, './uploads')
  },
  filename: function (request, file, cb) {
    cb(null, Date.now()+'-'+file.originalname.replace(' ', '-'));
  }
});
let privateUpload = multer({ storage: privateStorage });

app.get('/', function(request, response) {
  response.render('index');
});

app.post('/uploadfile', privateUpload.any(), async (request, response) => {
  console.log("/uploadfile route");
  const file = request.files[0];
  console.log(file);
  console.log(request.body.message);

  if (!file) {
    const error = {
    'httpStatusCode' : 400,
    'message':'Please upload a file'
     }
    response.send(error);
  }
  let photoLocations=[];
  let fileURL = await File.uploadFile(file);
  photoLocations.push(fileURL);
  response.render('confirmation',{
    photoLocations: photoLocations
  });
});

//Uploading multiple files
app.post('/uploadmultiple', privateUpload.any(), async (request, response, next) => {
  const files = request.files;
  if (!files) {
    const error = new Error('Please choose files')
    error.httpStatusCode = 400
    return next(error)
  }
  let photoLocations = await File.uploadFiles(files);
  console.log(photoLocations)
  response.render('confirmation',{
    photoLocations: photoLocations
  });
});
//
// // SET STORAGE
// let privateStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './public/uploads')
//   },
//   filename: function (req, file, cb) {
//     console.log(file)
//     cb(null, Date.now()+'-'+file.originalname.replace(' ', '-'));
//   }
// });
// let privateUpload = multer({ storage: privateStorage });
//
// let publicStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './public/images')
//   },
//   filename: function (req, file, cb) {
//     console.log(file)
//     cb(null, Date.now()+'-'+file.originalname.replace(' ', '-'));
//   }
// });
// let publicUpload = multer({ storage: publicStorage });
//
// app.get('/', function(req, res) {
//   res.render('index');
// });
//
// app.post('/uploadfile', privateUpload.single('myFile'), (req, res) => {
//   const file = req.file
//   if (!file) {
//     const error = {
//     'httpStatusCode' : 400,
//     'message':'Please upload a file'
//      }
//     res.send(error);
//   }
//   res.send(file)
// });
//
// // app.post('/uploadfile', privateUpload.any(), async (request, response) => {
// //   console.log("/uploadfile route");
// //   const file = request.files[0];
// //   console.log(file);
// //   console.log(request.body.message);
// //
// //   if (!file) {
// //     const error = {
// //     'httpStatusCode' : 400,
// //     'message':'Please upload a file'
// //      }
// //     response.send(error);
// //   }
// //   let photoLocations=[];
// //   let fileURL = await File.uploadFile(file);
// //   photoLocations.push(fileURL);
// //   response.render('confirmation',{
// //     photoLocations: photoLocations
// //   });
// // });
//
// //Uploading to a public static folder
// app.post('/upload/photo', publicUpload.single('picture'), (req, res, next) => {
//   const file = req.file;
//   if (!file) {
//     const error = {
//     'httpStatusCode' : 400,
//     'message':'Please upload a file'
//      }
//     res.send(error);
//   }
//
//   res.render('confirmation',{
//     photoLocation: "/images/"+file.filename
//   });
// });


app.use("", function(request, response) {
  response.redirect('/error?code=400');
});

//Start server.
const port = process.env.PORT || 3000;

let socketapi =require('./controllers/socketConnections');
socketapi.io.attach(server);//attach sockets to the server


server.listen(port, function() {
  console.log('Server started at http://localhost:' + port + '.')
});
