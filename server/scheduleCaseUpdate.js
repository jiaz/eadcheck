/**
 * Load existing cases from database and schedule periodic update for them
 */

'use strict';

var CronJob = require('cron').CronJob;
var Case = require('./api/case/case.model');
var request = require('request');
var nodemailer = require('nodemailer');

var jobs = {}

function scheduleUpdate(cs) {
  if (jobs[cs.name]) return;

  console.log("setting up auto update for case: " + cs.name);
  var job = new CronJob('*/30 * * * * *', function(){
      console.log("Checking: " + cs.name)
      request.post({url: 'https://egov.uscis.gov/casestatus/mycasestatus.do', form: {appReceiptNum:cs.caseId}},
        function(err, httpResponse, body) {
          console.log('finished');
          if (err) console.log(err);
          else {
            var lines = body.split("\r\n");
            var i = lines.length - 1
            for (; i >= 0; i--) {
              if (lines[i].match(/<strong>Your Current Status:<\/strong>/)) break;
            }
            var statusLine = lines[i + 1];
            var status = statusLine.replace(/\s/g, '');
            var prevStatus = cs.status;

            // update case status
            cs.status = status;
            cs.lastChecked = Date.now();
            cs.save(function(err) {
              if(err) {
                console.log("save case error: " + err);
              }
            });

            if (status !== prevStatus) {
              // create reusable transporter object using SMTP transport
              var transporter = nodemailer.createTransport({
                  service: 'Gmail',
                  auth: {
                      user: 'jiaji.zh@gmail.com',
                      pass: 'xxxx'
                  }
              });

              // setup e-mail data with unicode symbols
              var mailOptions = {
                  from: 'jiaji.zh@gmail.com', // sender address
                  to: 'jiajirocks@icloud.com', // list of receivers
                  subject: 'EAD Status Update', // Subject line
                  html: 'Case status changed from <b>' + prevStatus + '</b> to <b>' + status + '</b>', // plaintext body
              };

              // send mail with defined transport object
              transporter.sendMail(mailOptions, function(error, info){
                  if(error) {
                      console.log(error);
                  } else {
                      console.log('Message sent: ' + info.response);
                  }
              });
            }
          }
        });
    }, function () {
      // This function is executed when the job stops
    },
    true /* Start the job right now */
  );

  jobs[cs.name] = job;
}

setInterval(function() {

  Case.find(function(err, cases) {
    if (err) console.log(err);
    for (var i = cases.length - 1; i >= 0; i--) {
      scheduleUpdate(cases[i]);
    };
  });

}, 5000);
