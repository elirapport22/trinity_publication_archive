const express = require('express');
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const CREDENTIALS = require('../config/credentials.json');


const SCOPES = [
    'https://mail.google.com/',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.send'
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

  router = express.Router();

const Publications = require('../models/publications_model');

function loggedIn(request, response, next) {
  if (request.user) {
    user: request.this_user
    next();
  } else {
    response.redirect('/login');
  }
}

router.get('/student_publication_main/:id',loggedIn, function(request, response) {
  let publication = Publications.getPublicationByUser(request.user._json.email);
  response.status(200);
  response.setHeader('Content-Type', 'text/html');
  response.render('student_leaders/student_publication_admin', {
    user: request.this_user,
    this_publication: publication[request.params.id]
  });
});

router.get('/student_publication_admin_form/:publicationID',loggedIn, function(request, response) {
  response.status(200);
  response.setHeader('Content-Type', 'text/html');
  response.render("student_leaders/student_publication_admin_form",{
    user: request.this_user,
    publication:request.params.publicationID
  });
});

router.get('/student_publication_admin_form_update/:publicationID/:id',loggedIn, function(request, response) {
  console.log(request.param)
  let the_edition = Publications.getEdition(request.params.publicationID,request.params.id)
  response.status(200);
  response.setHeader('Content-Type', 'text/html');
  console.log(the_edition);
  response.render("student_leaders/student_publication_admin_form_update",{
    user: request.this_user,
    edition:the_edition,
    publication_name:request.params.publicationID
  });
});

router.post('/student_publication_admin_form',loggedIn, function(request, response) {

  let form_date = request.body.form_date;
  console.log(request.body);
  let pdflink = request.body.pdflink;
  let topics_covered = request.body["topics covered"];
  let  userID = request.user._json.email;
  let publicationID = request.body.publicationID;
  let new_edition_id = Publications.newEdition(publicationID,form_date,pdflink,topics_covered);
  let the_publication = Publications.getPublication(publicationID);
  send_email(publicationID,new_edition_id,pdflink,the_publication.advisor_email);
  response.status(200);
  response.setHeader('Content-Type', 'text/html');
  //Redirecting.
  response.redirect('/student_publication_main/'+publicationID);
});

router.post('/student_publication_admin_form_update',loggedIn, function(request, response) {
  let form_date = request.body.form_date;
  let pdflink = request.body.pdflink;
  let topics_covered = request.body["topics covered"];
  let  userID = request.user._json.email;
  let editionid = request.body.edition_ID;
  let publicationID = request.body.publicationID;
  Publications.editEdition(publicationID,editionid,form_date,pdflink,topics_covered);
  response.status(200);
  response.setHeader('Content-Type', 'text/html');
  //Redirecting.
  response.redirect('/student_publication_main/'+publicationID);
});

router.get('/approve_edition/:publication_name/:edition_id',loggedIn, function(request, response){
  Publications.approveEdition(request.params.publication_name,request.params.edition_id,request.user._json.email);
  response.status(200);
  response.setHeader('Content-Type', 'text/html');
  //Redirecting.
  response.redirect('/student_publication_main/'+request.params.publication_name);
});


//GMAIL API
//https://stackoverflow.com/questions/34546142/gmail-api-for-sending-mails-in-node-js
//https://developers.google.com/gmail/api/guides/sending

// Load client secrets from a local file.
function send_email(publication_name,edition_id,pdf_link,advisor_email){
  function authorized_actions(auth){
      sendMessage(auth,publication_name,edition_id,pdf_link,advisor_email)
    }
    authorize(CREDENTIALS, authorized_actions);
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function makeBody(to, from, subject, message) {
    var str = ["Content-Type: text/plain; charset=\"UTF-8\"\n",
        "MIME-Version: 1.0\n",
        "Content-Transfer-Encoding: 7bit\n",
        "to: ", to, "\n",
        "from: ", from, "\n",
        "subject: ", subject, "\n\n",
        message
    ].join('');

    var encodedMail = new Buffer(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
        return encodedMail;
}

function sendMessage(auth,publication_name,edition_id,pdf_link,advisor_email) {
  const gmail = google.gmail({version: 'v1', auth});
    var raw = makeBody(advisor_email, 'eli.rapport22@trinityschoolnyc.org', 'Approve '+ publication_name+"'s Edition?", "See Edition: "+pdf_link+"\n Approve Edition: https://pumpkin-pie-30391.herokuapp.com/approve_edition/"+encodeURIComponent(publication_name)+"/"+edition_id+"\n\nNOTE: Once you have signed in on website, please return to this link to approve!");
    gmail.users.messages.send({
        auth: auth,
        userId: 'me',
        resource: {
            raw: raw
        }
    }, function(err, response) {
      console.log(response);
        //res.send(err || response)
    });
}

module.exports = router;
