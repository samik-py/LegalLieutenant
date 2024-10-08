require("dotenv").config();

const process = require("process");
const path = require("path");
const fs = require("fs")
const express = require("express");
const multer = require("multer");
const reader = require("any-text");
const openai = require("openai");

const app = express();
const port = process.env["PORT"] || 3000;

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

const client = new openai.OpenAI({
  apiKey: process.env['OPENAI_API_KEY']
});

const groupSections = (documentContent) => {
  let splitSections = documentContent.replaceAll(/\s*((Article)|(Section)|(Preamble)|(Definitions)|(Clauses))\.?\s*((([0-9]+)|([IVXLCDM]+)|([A-Z]+))\.?)?\s*\r?\n/g, "[;break;]")
  splitSections = splitSections.replaceAll("\n", " ").split("[;break;]");

  if (splitSections.length == 1) {
    splitSections = splitSections[0].replaceAll(/([\.\?!])/g, "$1\n").split("\n");

    let result = [splitSections[0]];
    for (let i = 1; i < splitSections.length; i++) {
      const last = result[result.length - 1];
      if (last.length < 800) {
        result[result.length - 1] = last + splitSections[i];
      } else {
        result.push(splitSections[i]);
      }
    }

    splitSections = result;
  }

  const groupedSections = splitSections.map((section) => section.trim()).filter((section) => section != "")

  return groupedSections;
}

const summarize = async (section) => {
  const params = {
    messages: [{ role: 'user', content: `Summarize the following section from a legal document in one simple sentence:\n${section}` }],
    model: 'gpt-4o-mini',
  };
  const response = await client.chat.completions.create(params);
  return response.choices[0].message.content;
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
    const groupedSections = groupSections(documentContent);
    const sections = await Promise.all(groupedSections.map(async (section) => ({ content: section, summary: await summarize(section) })));
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
  const groupedSections = groupSections(documentContent);
  const sections = await Promise.all(groupedSections.map(async (section) => ({ content: section, summary: await summarize(section) })));
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

