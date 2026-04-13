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
transporter.sendMail({
  from: 'Gita Wisdom <gitawisdom143@gmail.com>',
  to: 'gitawisdom143@gmail.com',
  subject: 'Test email',
  text: 'Hello world'
}).then(console.log).catch(console.error);
