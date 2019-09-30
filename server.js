if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");

// Initialize routes
const indexRouter = require("./src/routes/index");
const redirectRouter = require("./src/routes/redirect");

// use ejs as view engine
app.set("view engine", "ejs");
// set where views are coming from (which is our views directory)
app.set("views", __dirname + "/src/views");
// hookup express layouts (set what our layout file is going to be)
app.set("layout", "layouts/layout");
// tell our app we want to use expressLayouts
app.use(expressLayouts);

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static("public"));

// Connect to Mongoose
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", error => console.error(error));
db.once("open", () => console.error("Connected to Mongoose"));

// Utilize routes
app.use("/", indexRouter);
app.use("/r", redirectRouter);
app.get("*", (req, res) => {
  res.render(path.resolve(__dirname, "src", "views", "index.ejs"));
});

app.listen(process.env.PORT || 3000);
