const express = require("express");
const mysql = require("mysql");
const multer = require("multer");
const fs = require("fs");
const { uuid } = require('uuidv4');
const router = express.Router();
const app = express();

const db = mysql.createConnection({
  host: PROCESS.ENV.HOST,
  user: PROCESS.ENV.USER,
  password: PROCESS.ENV.PASSWORD,
  database: PROCESS.ENV.DATABASE,
});

db.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("DB connected");
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    var date = new Date();
    var current_date = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    try {
      if (!fs.existsSync(`./uploads/${current_date}`)) {
        fs.mkdirSync(`./uploads/${current_date}`);
      }
    } catch (err) {
      console.error(err);
    }
    cb(null, `./uploads/${current_date}`);
  },
  filename: function (req, file, cb) {
    cb(null, uuid() + ".png");
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

router.post("/", upload.single("image"), (req, res, next) => {
  let post = { image: req.file.path };
  let sql = "INSERT INTO vdreamrp.images SET ?";
  let query = db.query(sql, post, (err, result) => {});
  res.send("https://api.vdream-rp.com/" + req.file.path);
});

router.delete("/:imageId", (req, res, next) => {
  res.status(200).json({
    message: "Deleted image",
  });
});

app.use('/uploads', express.static('uploads'));
app.use("/images", router);

module.exports = app;
