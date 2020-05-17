const sendMail = require('../email');

sendMail({
  subject: 'Exception saving to the DB',
  text: 'Check date 2020-05-12',
});
