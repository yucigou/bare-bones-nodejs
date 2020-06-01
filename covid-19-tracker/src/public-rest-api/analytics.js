const ua = require('universal-analytics');

const visitor = ua('UA-168089235-1');
const EventCategory = {
  Covid19Tracker: 'COVID-19 Tracker',
};

const sendEvent = (category, action) => {
  visitor.event(category, action).send();
};

module.exports = {
  sendEvent,
  EventCategory,
};
