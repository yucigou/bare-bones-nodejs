const extraCountries = [
  { name: 'Aruba' },
  { name: 'Cape Verde' },
  { name: 'Cayman Islands' },
  { name: 'Channel Islands' },
  { name: 'Curacao' },
  { name: 'Czech Republic' },
  { name: 'East Timor' },
  { name: 'Faroe Islands' },
  { name: 'French Guiana' },
  { name: 'Gibraltar' },
  { name: 'Greenland' },
  { name: 'Guadeloupe' },
  { name: 'Guam' },
  { name: 'Guernsey' },
  { name: 'Ivory Coast' },
  { name: 'Jersey' },
  { name: 'Martinique' },
  { name: 'Mayotte' },
  { name: 'Others', aliases: ['Cruise Ship'] },
  {
    name: 'Palestinian',
    aliases: ['occupied Palestinian territory', 'Palestine'],
  },
  { name: 'Puerto Rico' },
  { name: 'Reunion' },
  { name: 'Saint Barthelemy' },
  { name: 'St. Martin', aliases: ['Saint Martin'] },
  { name: 'Vatican City' },
];

const processNewCountryName = (name) => name.trim();

const curateCountryName = ({ name, iso2, iso3, aliases }) => {
  if (name === 'Bahamas') {
    return {
      name,
      iso2,
      iso3,
      aliases: ['The Bahamas', 'Bahamas, The'],
    };
  }
  if (name === 'China') {
    return {
      name,
      iso2,
      iso3,
      aliases: [
        'Mainland China',
        'Hong Kong',
        'Hong Kong SAR',
        'Macau',
        'Macao SAR',
      ],
    };
  }
  if (name === 'Congo (Brazzaville)') {
    return {
      name,
      iso2,
      iso3,
      aliases: ['Republic of the Congo'],
    };
  }
  if (name === 'Gambia') {
    return {
      name,
      iso2,
      iso3,
      aliases: ['The Gambia', 'Gambia, The'],
    };
  }
  if (name === 'Iran') {
    return {
      name,
      iso2,
      iso3,
      aliases: ['Iran (Islamic Republic of)'],
    };
  }
  if (name === 'Ireland') {
    return {
      name,
      iso2,
      iso3,
      aliases: ['Republic of Ireland'],
    };
  }
  if (name === 'Korea, South') {
    return {
      name: 'South Korea',
      iso2,
      iso3,
      aliases: [name, 'Republic of Korea'],
    };
  }
  if (name === 'Moldova') {
    return {
      name,
      iso2,
      iso3,
      aliases: ['Republic of Moldova'],
    };
  }
  if (name === 'Russia') {
    return {
      name,
      iso2,
      iso3,
      aliases: ['Russian Federation'],
    };
  }
  if (name.match(/Taiwan/)) {
    return {
      name: 'Taiwan',
      iso2,
      iso3,
      aliases: ['Taiwan*', 'Taipei and environs'],
    };
  }
  if (name === 'United Kingdom') {
    return {
      name,
      iso2,
      iso3,
      aliases: ['UK', 'North Ireland'],
    };
  }
  if (name === 'Vietnam') {
    return {
      name,
      iso2,
      iso3,
      aliases: ['Viet Nam'],
    };
  }

  return { name: processNewCountryName(name), iso2, iso3, aliases };
};

module.exports = {
  extraCountries,
  curateCountryName,
  processNewCountryName,
};
