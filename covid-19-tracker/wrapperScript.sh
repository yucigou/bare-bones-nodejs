#!/bin/bash

echo "Seeding the DB"
node src/seeds/load-countries.js

echo "Running Covid-19 Tracker API"
pm2 start src/pm2.config.js

echo "Finished init."

tail -f /dev/null
