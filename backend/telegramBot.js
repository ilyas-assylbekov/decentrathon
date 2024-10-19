const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const {jwtDecode} = require('jwt-decode');
const fs = require('fs');
const path = require('path');

// Replace with your Telegram bot token
const token = '7561069313:AAF7gDViNCMA9758sRWnI95gxY_SdOodCCI';
const bot = new TelegramBot(token, { polling: true });

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Welcome to the Job Search Bot! Please send your resume as a file.');
});

// Handle file uploads
bot.on('document', async (msg) => {
  const chatId = msg.chat.id;
  const fileId = msg.document.file_id;

  // Get file link
  const fileLink = await bot.getFileLink(fileId);

  // Download the file
  const response = await axios.get(fileLink, { responseType: 'stream' });
  const filePath = path.join(__dirname, 'uploads', msg.document.file_name);
  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);

  writer.on('finish', async () => {
    bot.sendMessage(chatId, 'Resume received. Please provide the job title and company name in the format: Job Title at Company Name');
  });

  writer.on('error', (err) => {
    console.error('Error downloading file:', err);
    bot.sendMessage(chatId, 'Error receiving resume. Please try again.');
  });
});

// Handle job title and company name
bot.onText(/(.+) at (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const jobTitle = match[1];
  const companyName = match[2];

  // Simulate getting the user token (in a real app, you would authenticate the user)
  const token = 'YOUR_USER_JWT_TOKEN';
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.id;
  const name = decodedToken.name;

  if (!name) {
    bot.sendMessage(chatId, 'Failed to get user name.');
    return;
  }

  const formData = new FormData();
  formData.append('name', name);
  formData.append('position', jobTitle);
  formData.append('company', companyName);
  formData.append('resume', fs.createReadStream(path.join(__dirname, 'uploads', msg.document.file_name)));
  formData.append('userId', userId);

  try {
    const response = await axios.post('http://localhost:3000/apply', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    bot.sendMessage(chatId, 'Application submitted successfully.');
  } catch (error) {
    console.error('Error submitting application:', error);
    bot.sendMessage(chatId, 'Error submitting application. Please try again.');
  }
});