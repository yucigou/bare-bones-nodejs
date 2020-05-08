require('dotenv').config();
const { logger } = require('config');
const mongoose = require('mongoose');

// mongoose.set('debug', true);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  logger.info('We are connected!');
});

mongoose.connect(
  `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@localhost:27017/mydb?authSource=admin`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

var Customer = require('./models/customer');

Customer.find({}, (err, customers) => {
  if (err) {
    console.log('err: ', err);
    return;
  }

  console.log('customers: ', customers);
  // mongoose.disconnect();
})
  .then(() => {})
  .catch((err) => console.log(err))
  .finally(() => {
    console.log('Closing DB...');
    mongoose.disconnect();
  });

new Customer({
  name: 'Yuci',
  address: '8 Grantchester',
})
  .save()
  .then((customer) => {
    console.log('New customer: ', customer);
  });

console.log('The End');
