var express = require("express");
const router = express.Router();

// Import schema
const Url = require("../models/url");

// Redirect user to original URL
router.get("/:short_url?", (req, res) => {
  findOriginalByShortCode(req.params.short_url, (err, data) => {
    res.redirect(data[0].original);
  });
});

/* --- Function --- */
// Lookup the short-code in the DB (Used to redirect user to original URL)
const findOriginalByShortCode = (shortCode, done) => {
  Url.find({ short: shortCode }, (err, data) => {
    if (err) return done(err);
    return done(null, data);
  });
};

// ------------------------------ //
module.exports = router;
