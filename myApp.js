var express = require('express');
var mongoose = require('mongoose');
var app = express();
const dns = require('dns');

// Initialize Mongoose Schema
var Schema = mongoose.Schema;

/* Function to create 7 character "Short URL Code" at the end of the URL.
Code was refactored based on the following: https://codehandbook.org/generate-random-string-characters-in-javascript/
*/
function createShortUrl(url_length){
    let cap_start = 65,  cap_end = 90, lower_start = 97, lower_end = 122, num_start = 1, num_end = 9;
    let divider;  
    let shortUrlArray = [];

    for(let i = 0; i < url_length; i++) {
        divider = Math.random();
        if(divider <= .10) {
          shortUrlArray.push(Math.floor((Math.random() * (num_end - num_start)) + num_start));

        } else if (divider > .10 && divider <= .50) {    
            let random_cap_ascii = Math.floor((Math.random() * (cap_end - cap_start)) + cap_start);
            shortUrlArray.push(String.fromCharCode(random_cap_ascii))
          
        } else {
            let random_lower_ascii = Math.floor((Math.random() * (lower_end - lower_start)) + lower_start);
            shortUrlArray.push(String.fromCharCode(random_lower_ascii))
        }
    }
    return shortUrlArray.join("");
}

// Define URL Schema
var urlSchema = new Schema({
  original: { type: String, required: true, unique: true }, 
  short: { type: String, required: true, unique: true }
});

// Create Url constructor
var Url = mongoose.model('Url', urlSchema);

// Function to create & save URL MongoDB documents
var saveShortUrl = function (elem, done) {
  Url.create(elem, function(err, data) {
    if(err) return done(err);
      done(null, data);
    })
};

let linkValidate;

// Check if string starts with http (https://stackoverflow.com/a/11300985)
let myHttpRegex = /^(f|ht)tps?:\/\//;

// Function to lookup the original Url in the DB (in case of repeat entries of the same URL)
var findExistingOriginal = function(elem, done) {
  Url.findOne( {original: elem}, function(err, data) {
    if(err) return done(err);
      return done(null, data);
  })
}; 

app.post('/api/shorturl/new',function(req,res) {
  // Get URL that was submitted by the user
  let original = req.body.url;

   findExistingOriginal(original, (err,data) => {
      if(err){console.log(err);}
       if(data == null) {
  
          // Create a 7 character URL short-code to make a short URL
          let shortUrl = createShortUrl(7);

            // If input URL does not start with http, https or ftp, admonish user
            if(original.match(myHttpRegex) == null) {
              res.json({"error":"invalid URL"});

              // Otherwise, create new URL object
            } else {
                linkValidate = new URL(req.body.url);    

                // Verify URL points to valid site
                myDNS = dns.lookup(linkValidate.hostname, (err, address, family) => {
                  console.log(err);

                    if(address == undefined) {
                      res.json({"error":"invalid Hostname"});
                    }
                    else {
                      // Pass our two inputs above to our Url constructor function
                      saveShortUrl([{original: original, short: shortUrl}], (err,data) => {
                          if(err){console.log(err);}
                        console.log(data);
                        })

                      // Output to the user upon submitting a new link (not yet currently in DB)
                      res.json({original_url: original, short_url: "https://kos.glitch.me/api/shorturl/" +shortUrl});  
                     }
                 }); 
              }
      } else {
          // If the URL is already in the DB, provide the short URL that has already been generated.
          res.json({original_url: data.original, short_url: data.short});
        }
    }) 
}) 

  // Function to lookup the shortUrl in the DB
  var findOriginalByShortCode = function(shortCode, done) {
    Url.find( {short: shortCode}, function(err, data) {
      if(err) return done(err);
        return done(null, data);
    })
  }; 

// Redirect user to original site
app.get('/api/shorturl/:short_url?',function(req,res) {
 let link = req.params.short_url
 
   findOriginalByShortCode(link, (err,data) => {
      if(err){console.log(err);}
     // https://stackoverflow.com/questions/4062260/nodejs-redirect-url/4062281
    res.redirect(data[0].original);
  })

})

// ------------------------------ //
module.exports = app;
