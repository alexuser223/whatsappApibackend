const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');


const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

// Storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now()  + ext);
  },
});

const upload = multer({ storage });

// Routes
app.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    res.json({ filePath: `/${req.file.path}` });
  } else {
    res.status(400).send('Error uploading file');
  }
});

app.get('/files', (req, res) => {
  fs.readdir('uploads/', (err, files) => {
    if (err) res.status(500).send('Error reading files');
    res.json(files);
  });
});

app.delete('/delete/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  fs.unlink(filePath, (err) => {
    if (err) res.status(500).send('Error deleting file');
    res.send('File deleted');
  });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));




const product_id = '03f4ec52-3b2d-4b1c-91a2-8873ddaaddf7';
const phone_id = '29886';
const secret_token = '0af3905d-3b1e-4f6d-a03e-61fcd1e938f0';

app.post('/sendMessages', async (req, res) => {
  const { customers, messageType, message, selectedFiles } = req.body;

  const sendMessage = async (data) => {
    const url = `https://api.maytapi.com/api/${product_id}/${phone_id}/sendMessage`;
    try {
      const response = await axios.post(url, data, {
        headers: {
          'x-maytapi-key': secret_token,
          'Content-Type': 'application/json',
        },
      });
      console.log('Message sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  try {
    for (let customer of customers) {
      const toNumber = customer.Customer_Number;

      if (messageType === 'text') {
        await sendMessage({
          to_number: toNumber,
          type: messageType,
          message: message,
        });
      } else if (messageType === 'media') {
        for (let [index, url] of selectedFiles.entries()) {
          let data = {
            to_number: toNumber,
            type: messageType,
            message: url,
            text: index === selectedFiles.length - 1 ? message : '',
          };
          await sendMessage(data);
        }
      }
    }
    res.status(200).send('Messages sent successfully');
  } catch (error) {
    res.status(500).send('Error sending messages');
  }
});







app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
