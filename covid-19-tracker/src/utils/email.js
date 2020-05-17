require('dotenv').config();
const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: process.env.MAILER_SERVER,
  port: process.env.MAILER_PORT,
  secure: false,
});

const sendMail = ({ subject, text }) => {
  const mailOptions = {
    from: process.env.MAILER_FROM,
    to: process.env.MAILER_TO,
    subject,
    text,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      logger.error(`Error sending email ${error}`);
    } else {
      logger.info(`Mail sent: ${info.response}`);
    }
  });
};

module.exports = sendMail;
