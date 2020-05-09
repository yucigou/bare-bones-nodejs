const { logger } = require('config');
var unirest = require('unirest');

var req = unirest('GET', 'https://world-population.p.rapidapi.com/population');

req.query({
  country_name: 'India',
});

req.headers({
  'x-rapidapi-host': 'world-population.p.rapidapi.com',
  'x-rapidapi-key': 'd83a565ecbmshdff39d7760824e5p1b67b5jsn1792ee70e166',
});

req.end(function (res) {
  if (res.error) throw new Error(res.error);

  console.log(res.body);
});
