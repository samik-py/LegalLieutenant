const express = require("express");
const process = require("process");
const multer = require("multer");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  res.render("pages/index");
});

app.get("/upload", (req, res) => {
  res.render("pages/upload");
});

app.post("/upload-file", upload.single("file"), (req, res) => {
  if (req.file) {
    res.status(201).render("pages/index");
  } else {
    res.status(400).render("pages/upload");
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}.`);
});
