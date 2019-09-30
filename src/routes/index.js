var express = require("express");
const router = express.Router();
const dns = require("dns");

// Import schema
const Url = require("../models/url");

// Render index.ejs
router.get("/", (req, res) => {
  res.render("index");
});

// Add short-code (for short URL) to DB
router.post("/", (req, res) => {
  // Get URL that was submitted by the user
  let originalURL = req.body.url;

  /* If the URL is already in the DB, return to the user the previously 
  assigned 'short code'; otherwise, this is a new URL - shorten it */
  findOriginalURL(originalURL, (err, data) => {
    if (data !== null) {
      res.render("index", {
        short_url: process.env.BASE_URL + data.short
      });
    } else {
      /* If input URL does not start with http, https or ftp, admonish user
      Source: (https://stackoverflow.com/a/11300985) */
      if (originalURL.match(/^(f|ht)tps?:\/\//) == null) {
        res.render("index", { errorMessage: "Invalid URL" });

        // Otherwise, create new URL object
      } else {
        let shortCode = createShortCode(7);

        let linkValidate = new URL(originalURL);

        // Verify URL points to valid site
        dns.lookup(linkValidate.hostname, (err, address, family) => {
          if (address == undefined) {
            res.render("index", { errorMessage: "Invalid Hostname" });
          } else {
            saveShortCode(
              [{ original: originalURL, short: shortCode }],
              (err, data) => {
                if (err) {
                  console.log(err);
                }
              }
            );

            // Output to the user upon submitting a new link (not yet currently in DB)
            res.render("index", {
              short_url: process.env.BASE_URL + shortCode
            });
          }
        });
      }
    }
  });
});

/* --- Functions --- */

// Create a 7 character 'short-code' to add onto the end of a short URL
const createShortCode = url_length => {
  let cap_start = 65,
    cap_end = 90,
    lower_start = 97,
    lower_end = 122,
    num_start = 1,
    num_end = 9;
  let divider;
  let shortCodeArr = [];

  for (let i = 0; i < url_length; i++) {
    divider = Math.random();
    if (divider <= 0.1) {
      shortCodeArr.push(
        Math.floor(Math.random() * (num_end - num_start) + num_start)
      );
    } else if (divider > 0.1 && divider <= 0.5) {
      let random_cap_ascii = Math.floor(
        Math.random() * (cap_end - cap_start) + cap_start
      );
      shortCodeArr.push(String.fromCharCode(random_cap_ascii));
    } else {
      let random_lower_ascii = Math.floor(
        Math.random() * (lower_end - lower_start) + lower_start
      );
      shortCodeArr.push(String.fromCharCode(random_lower_ascii));
    }
  }
  return shortCodeArr.join("");
};

// Save 'short-code' in DB
const saveShortCode = (elem, done) => {
  Url.create(elem, (err, data) => {
    if (err) return done(err);
    done(null, data);
  });
};

// Lookup the original Url in the DB (in case of repeat entries of the same URL)
const findOriginalURL = (elem, done) => {
  Url.findOne({ original: elem }, (err, data) => {
    if (err) return done(err);
    return done(null, data);
  });
};

// ------------------------------ //
module.exports = router;
