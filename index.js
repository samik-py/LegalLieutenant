const process = require("process");
const path = require("path");
const fs = require("fs")
const express = require("express");
const multer = require("multer");
const reader = require("any-text");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }))
app.set("view engine", "ejs");

const storage = multer.diskStorage({
  destination: function (_, _, cb) {
    cb(null, 'uploads/');
  },
  filename: function (_, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const summarize = async (section) => {
  // TODO: Insert AI code here
  return "summary"
}

app.get("/", (_, res) => {
  res.render("pages/index");
});

app.get("/explain", (_, res) => {
  res.render("pages/explain-upload");
});

app.get("/generate", (_, res) => {
  res.render("pages/generate-upload");
});

app.post("/explain-file", upload.single("file"), async (req, res) => {
  if (req.file) {
    const documentContent = await reader.getText(req.file.path);
    const all_sections = await Promise.all(documentContent.split("\n").map(async (section) => ({ content: section, summary: await summarize(section) })));
    const sections = all_sections.filter((section) => section.content.trim() != "")
    fs.unlink(req.file.path, (err) => {
      if (err) console.error(err)
    })
    res.render("pages/explain-results", { sections });
  } else {
    res.redirect("/explain");
  }
});

app.post("/explain-text", async (req, res) => {
  const documentContent = req.body.documentContent;
  const all_sections = await Promise.all(documentContent.split("\n").map(async (section) => ({ content: section, summary: await summarize(section) })));
  const sections = all_sections.filter((section) => section.content.trim() != "")
  res.status(201).render("pages/explain-results", { sections });
});

app.post("/generate", (req, res) => {
  const formName = req.body.formName;
  const information = req.body.information;
  res.render("pages/generate-results", { formName, information })
})

app.listen(port, () => {
  console.log(`Server started on port ${port}.`);
});

