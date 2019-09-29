const mongoose = require("mongoose");

// Define URL Schema
const urlSchema = new mongoose.Schema({
  original: { type: String, required: true, unique: true },
  short: {
    type: String,
    required: true,
    unique: true
  }
});

// Create Url constructor
module.exports = mongoose.model("Url", urlSchema);
