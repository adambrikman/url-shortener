if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

("use strict");

const express = require("express");
const app = express();
const cors = require("cors");
const expressLayouts = require("express-ejs-layouts");

const indexRouter = require("./src/routes/index");

// use ejs as view engine
app.set("view engine", "ejs");
// set where views are coming from (which is our views directory)
app.set("views", __dirname + "/src/views");
// hookup express layouts (set what our layout file is going to be)
app.set("layout", "layouts/layout");
// tell our app we want to use expressLayouts
app.use(expressLayouts);

app.use(express.static("public"));

// parse POST requests
app.use(express.urlencoded({ extended: false }));

app.use(cors());

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", error => console.error(error));
db.once("open", () => console.error("Connected to Mongoose"));

app.use("/", indexRouter);

app.listen(process.env.PORT || 3000);
