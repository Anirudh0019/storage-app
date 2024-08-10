const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
app.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const fileBuffer = fs.readFileSync(req.file.path);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  const fileHash = hashSum.digest('hex');

  res.json({ filename: req.file.filename, fileHash: fileHash });
});

app.get('/download/:filename', (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(__dirname, 'uploads', filename);
  res.download(filepath, filename);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});