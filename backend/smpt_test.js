const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'gitawisdom143@gmail.com',
    pass: 'rketmrxdqgcltnzy',
  },
});
transporter.verify().then(() => console.log('success')).catch(console.error);
