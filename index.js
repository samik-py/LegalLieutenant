const process = require("process");
const path = require("path");
const fs = require("fs")
const express = require("express");
const multer = require("multer");
const reader = require("any-text");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

const storage = multer.diskStorage({
  destination: function(_, _, cb) {
    cb(null, 'uploads/');
  },
  filename: function(_, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

app.get("/", (_, res) => {
  res.render("pages/index");
});

app.get("/understand", (_, res) => {
  res.render("pages/understand");
});

app.get("/fill", (_, res) => {
  res.render("pages/fill");
});

app.post("/upload", upload.single("file"), async (req, res) => {
  if (req.file) {
    const documentContent = await reader.getText(req.file.path);
    fs.unlink(req.file.path, (_) => { })
    res.status(201).render("pages/explain", { documentContent });
  } else {
    res.redirect(400, "/");
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}.`);
});

