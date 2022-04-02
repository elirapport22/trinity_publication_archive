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
