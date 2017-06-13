var express = require('express');
var path    = require('path');
var nforce  = require('nforce');

var hbs = require('hbs');
var data = require('data');
var app = express();
var jsonfile = require('jsonfile');
app.set('view engine', 'hbs');
app.enable('trust proxy');

function isSetup() {
  return (process.env.CONSUMER_KEY != null) && (process.env.CONSUMER_SECRET != null);
}

function oauthCallbackUrl(req) {
  return req.protocol + '://' + req.get('host');
}

hbs.registerHelper('get', function(field) {
  return this.get(field);
});

app.get('/', function(req, res) {
  if (isSetup()) {
    console.log('setup');
    var org = nforce.createConnection({
      clientId: process.env.CONSUMER_KEY,
      clientSecret: process.env.CONSUMER_SECRET,
      redirectUri: oauthCallbackUrl(req),
      mode: 'single'
    });

    if (req.query.code !== undefined) {
      // authenticated
      org.authenticate(req.query, function(err) {
        if (!err) {
          var q = 'SELECT id, name, type, industry, billingState, rating FROM Account';
          //var q = 'SELECT id, name FROM Contact LIMIT 20';
          org.query({ query: q }, function(err, results) {
            if (!err) {
              /*var acc = results.records[0];
              acc.set('Industry','Finance');
              org.update({sobject: acc}, function(err, results){
                if(!err){
                  console.log('It worked');
                }
              });*/
              res.render('index', {records: results.records});

              var file = '/users/mprown/youngwave/data.json';
              var obj = results.records;
            jsonfile.writeFileSync(file, obj);

          console.log('After JSON Write');
            }
            else {
              res.send(err.message);
            }
          });
        }
        else {
          if (err.message.indexOf('invalid_grant') >= 0) {
            res.redirect('/');
          }
          else {
            res.send(err.message);
          }
        }
      });
    }
    else {
      res.redirect(org.getAuthUri());
    }
  }
  else {
    res.redirect('/setup');
  }
});

app.get('/setup', function(req, res) {
  if (isSetup()) {
    res.redirect('/');
  }
  else {
    var isLocal = (req.hostname.indexOf('localhost') == 0);
    var herokuApp = null;
    if (req.hostname.indexOf('.herokuapp.com') > 0) {
      herokuApp = req.hostname.replace(".herokuapp.com", "");
    }
    res.render('setup', { isLocal: isLocal, oauthCallbackUrl: oauthCallbackUrl(req), herokuApp: herokuApp});
  }
});
app.get('/accounts', function(req, res, next){
  return data;
  res.json({"name":"Smart Money Group Llc","type":"RIA","industry":"Finance","billingstate":"TX","rating":null,"id":"0010L00001iJQ1cQAG"});
});
app.post('/accounts', function(req, res, next) {
  var accounts = ['LPL'];
  animals.push(req.body.name);
  res.status(201).json({accounts:accounts});
}
//app.listen(process.env.PORT || 5000);
