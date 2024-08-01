// Assuming you are using Express.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const product_id = '03f4ec52-3b2d-4b1c-91a2-8873ddaaddf7';
const phone_id = '29886';
const secret_token = '0af3905d-3b1e-4f6d-a03e-61fcd1e938f0';

router.post('/sendMessages', async (req, res) => {
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

module.exports = router;
