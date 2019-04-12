// express und http Module importieren. Sie sind dazu da, die HTML-Dateien
// aus dem Ordner "public" zu veröffentlichen.
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var port = process.env.PORT || 1337;

var crypto = require('crypto')
var cookieParser = require('cookie-parser')
var formidable = require('formidable');
var fs = require('fs');
app.use(cookieParser())

app.use(cookieParser())

var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Mit diesem Kommando starten wir den Webserver.
server.listen(port, function () {
  // Wir geben einen Hinweis aus, dass der Webserer läuft.
  console.log('Server runs on port %d', port);
});


// set a cookie
app.use(function (req, res, next) {
  // check if client sent cookie
  var cookie = req.cookies.cookieName;
  if (cookie === undefined) {
    // no: set a new cookie
    var randomNumber = Math.random().toString();
    randomNumber = randomNumber.substring(2, randomNumber.length);
    res.cookie('cookieRandomNumber', randomNumber, { maxAge: 900000, httpOnly: true });
    console.log('cookie created successfully');
  }
  else {
    // yes, cookie was already present 
    console.log('cookie exists', cookie);
  }
  next(); // <-- important!
});

// let static middleware do its job

app.post('/submit-login', function (req, res) {
  var user_name = req.body.user;
  var password = req.body.password;
  res.cookie('cookieName', user_name, { maxAge: 900000, httpOnly: true });

  var shasum = crypto.createHash('sha1');
  shasum.update(password);
  var passwordhash = shasum.digest('hex')
  console.log(passwordhash);
  // "0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33"
  res.cookie('cookiePassword', passwordhash, { maxAge: 900000, httpOnly: true });
  console.log("User name = " + user_name + ",password is " + password);
  res.redirect('/Lemming.html');
});

// Hier teilen wir express mit, dass die öffentlichen HTML-Dateien
// im Ordner "public" zu finden sind.
app.post("/fileupload", function (req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var oldpath = files.filetoupload.path;
    var newpath = process.env.UPLOAD_FOLDER + files.filetoupload.name;
    fs.copyFile(oldpath, newpath, function (err) {
      if (err) throw err;
      res.redirect('/succes.html');
      res.end();
    });
  });
})

app.get("/", function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
  res.write('<input type="file" name="filetoupload"><br>');
  res.write('<input type="submit">');
  res.write('</form>');
  return res.end('/succes.html');
})

app.use(express.static(__dirname + '/public'));



