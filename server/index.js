const express = require('express');
const path = require('path');
const multer = require('multer');
const app = express();
const port = 3000;


const upload = multer({ dest: 'uploads/' });


app.use(express.static(path.join(__dirname, '../public')));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});


app.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    console.log('File received:', req.file);
    res.send('File uploaded successfully!');
  } else {
    res.status(400).send('No file uploaded');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
