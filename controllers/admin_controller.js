const express = require('express');

  router = express.Router();

const Publications = require('../models/publications_model');
const User = require('../models/user_model');
/*
  This is a function that allows us to avoid putting an
  if (loggedIn)... else (login)
  in every route. Instead, we include it as middleware and use
  next() to indicate that the next function in the chain of functions
  should be executed if the user is logged in
*/
function loggedIn(request, response, next) {
  if (request.user) {
    next();
  } else {
    response.redirect('/login');
  }
}


router.get('/adminMain',loggedIn, function(request, response) {
  let the_pubs = Publications.getAllPublications();

  response.status(200);
  response.setHeader('Content-Type', 'text/html');
  response.render('admin/admin_main', {
    user: request.this_user,
    publications:Object.values(the_pubs)
  });
});


router.post('/adminMainDeletePublication',loggedIn, function(request, response) {
  let deleting_publication = request.body.deletingPublicationName;
  let deleting_publication_object = Publications.getPublication(deleting_publication);
  console.log(deleting_publication_object)
  User.removeStudentLeader(deleting_publication_object.student_leader,deleting_publication);
  User.removeAdvisor(deleting_publication_object.advisor_email,deleting_publication);
  Publications.deletePublication(deleting_publication);
  response.status(200);
  response.setHeader('Content-Type', 'text/html');
  response.redirect('/adminMain');
});

router.get('/adminMainForm/:publication_name',loggedIn, function(request, response) {
  let pulling_pub_info = Publications.getPublication(request.params.publication_name);

  response.status(200);
  response.setHeader('Content-Type', 'text/html');
  response.render("admin/admin_main_form", {
    user: request.this_user,
    publication:pulling_pub_info
  });
});

//updating publications
router.post('/adminMainForm',loggedIn, function(request, response) {
  Publications.editPublication(request.body.pub_name,request.body.advisor_email,request.body.student_leader,request.body.new_publication_name);
  User.removeStudentLeader(request.body.old_student_leader,request.body.pub_name);
  User.removeAdvisor(request.body.old_advisor,request.body.pub_name);
  User.makeStudentLeader(request.body.student_leader,request.body.new_publication_name);
  User.makeAdvisor(request.body.advisor_email,request.body.new_publication_name);

  response.status(200);
  response.setHeader('Content-Type', 'text/html');
  //Redirecting.
  response.redirect('/adminMain');
});



router.get('/adminNewPub',loggedIn, function(request, response) {
  response.status(200);
  response.setHeader('Content-Type', 'text/html');
  response.render("admin/admin_new", {
    user: request.this_user
  });
});

router.post('/adminNewPub',loggedIn, function(request, response) {
  let publication_name = request.body.publication_name;
  let advisor_email = request.body.advisor_email;
  let student_leader = request.body.student_leader;

  Publications.newPublication(student_leader,advisor_email,publication_name);
  User.makeAdvisor(advisor_email,publication_name);
  User.makeStudentLeader(student_leader,publication_name);

  response.status(200);
  response.setHeader('Content-Type', 'text/html');
  //Redirecting.
  response.redirect('/adminMain');
});

module.exports = router;
