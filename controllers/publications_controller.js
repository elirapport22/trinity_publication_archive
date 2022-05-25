const express = require('express');
  router = express.Router();


const Publication = require('../models/publications_model');


function loggedIn(request, response, next) {
  if (request.user) {
    next();
  } else {
    response.redirect('/login');
  }
}


router.get('/readerMain', loggedIn, function(request, response) {
  let publications = Publication.getAllPublications();
  let publication_array = []
  for(i in publications){
    publication_array.push(publications[i]);
  }
  let editions = Publication.getAllPublicationEditions();
  response.status(200);
  response.setHeader('Content-Type', 'text/html');
  response.render('reader/reader_main', {
    user: request.this_user,
    publications:publication_array,
    editions:editions,
  });
});


router.get('/edition/:id', loggedIn, function(request, response) {
  response.status(200);
  response.setHeader('Content-Type', 'text/html');
  let comments = Publication.getPublicationByEditionID(request.params.id).comments;
  console.log(comments);
  console.log("COMMENTS^")

  response.render('reader/edition', {
    user: request.this_user,
    edition_id:request.params.id,
    comments:comments,
  });
});

router.post('/saveComment',loggedIn,function(request,response){
  response.status(200);
  console.log(request.body)
  let edition_id = request.body.edition_id;
  let comment = request.body.comment;
  let user = request.body.user;
  console.log("REQBODY^")
  Publication.SaveComment(edition_id,comment,user);
  let comments = Publication.getPublicationByEditionID(edition_id).comments;
  console.log(comments)
  console.log("COMMMMEMEMEMENTS!^")

  response.setHeader('Content-Type','text/html');
  response.render('reader/edition',{
    user:request.this_user,
    edition_id:request.body.edition_id,
    comments:comments,

  });
});


router.post('/edition_comment', loggedIn, function(request, response) {

  response.status(200);
  response.setHeader('Content-Type', 'text/html');
  // response.send({
  //   //pubs:publications_array
  //   user: request.this_user,
  //   publications:publication_array,
  //   editions:editions,
  //
  // });
});

router.post('/updateReader', loggedIn, function(request, response) {
  let publications = Publication.getAllPublications();
  let publication_array = []
  for(i in publications){
    publication_array.push(publications[i]);
  }

  let editions = Publication.getAllPublicationEditions(request.body.checked_publications,request.body.checked_topics);
  response.status(200);
  response.setHeader('Content-Type', 'text/html');
  response.send({
    //pubs:publications_array
    user: request.this_user,
    publications:publication_array,
    editions:editions,

  });
});

module.exports = router;
