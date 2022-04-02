const express = require('express'),
  router = express.Router();

const User = require('../models/user_model');


router.get('/', function(request, response) {
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render("index", {
    user: request.this_user
  });
});

router.get('/index', function(request, response) {
  response.status(200);
  response.setHeader('Content-Type', 'text/html');
  response.render('index', {
    user: request.this_user
  });
});

router.get('/login', function(request, response) {
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render("login", {
    user: request.this_user
  });
});

router.get('/error', function(request, response) {
  const errorCode = request.query.code;
  if (!errorCode) errorCode = 400;
  const errors = {
    '400': "Unknown Client Error",
    '401': "Invlaid Login",
    '404': "Resource Not Found",
    '500': "Server problem"
  }

  response.status(errorCode);
  response.setHeader('Content-Type', 'text/html')
  response.render("error", {
    user: request.this_user,
    "errorCode": errorCode,
    "details": errors[errorCode]
  });
});

module.exports = router
