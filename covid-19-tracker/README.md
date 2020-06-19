This API provides the Covid-19 daily stats for a given region or country, and this API complements the API provided by https://github.com/mathdroid/covid-19-api

# .env

```
MONGO_HOST=mongo
MONGO_PORT=27017
MONGO_DB_NAME=covid19
MONGO_INITDB_ROOT_USERNAME=xxx
MONGO_INITDB_ROOT_PASSWORD=xxx

MAILER_SERVER=mailer
MAILER_PORT=25
MAILER_FROM=xxx@example.com
MAILER_TO=xxx@example.com

WS_PORT=3000

MEMCACHED_HOST=memcached
```

# How to run

```
$ docker-compose down --remove-orphans
$ docker-compose -f docker-compose.prod.yml up -d --build
```

# API

## Get all available region names

```
http://localhost:3000/api/regions
```

## Get daily stats of a given region

```
http://localhost:3000/api/daily/Switzerland
```

## Get the latest daily stats of all regions

```
http://localhost:3000/api/daily
```

## Notes

This API can or should work with the API of the original data source provider.

- https://covid19.mathdro.id/api
- https://covid19.mathdro.id/api/daily

# Original Data Source with special thanks

- https://covid19.mathdro.id/api/countries
- https://covid19.mathdro.id/api/daily
- https://covid19.mathdro.id/api/daily/2020-05-17

# Monitoring

```
# curl http://nginx-prometheus-exporter:9113/metri
# HELP nginx_connections_accepted Accepted client connections
# TYPE nginx_connections_accepted counter
nginx_connections_accepted 26
# HELP nginx_connections_active Active client connections
# TYPE nginx_connections_active gauge
nginx_connections_active 1
# HELP nginx_connections_handled Handled client connections
# TYPE nginx_connections_handled counter
nginx_connections_handled 26
# HELP nginx_connections_reading Connections where NGINX is reading the request header
# TYPE nginx_connections_reading gauge
nginx_connections_reading 0
# HELP nginx_connections_waiting Idle client connections
# TYPE nginx_connections_waiting gauge
nginx_connections_waiting 0
# HELP nginx_connections_writing Connections where NGINX is writing the response back to the client
# TYPE nginx_connections_writing gauge
nginx_connections_writing 1
# HELP nginx_http_requests_total Total http requests
# TYPE nginx_http_requests_total counter
nginx_http_requests_total 98
# HELP nginx_up Status of the last metric scrape
# TYPE nginx_up gauge
nginx_up 1
# HELP nginxexporter_build_info Exporter build information
# TYPE nginxexporter_build_info gauge
nginxexporter_build_info{gitCommit="a2910f1",version="0.7.0"} 1
```

# Development

## .env

```
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DB_NAME=covid19
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=example

MAILER_SERVER=localhost
MAILER_PORT=25
MAILER_FROM=devops@codegoodworks.dev
MAILER_TO=yuci.gou@gmail.com

WS_PORT=3000

MEMCACHED_HOST=localhost
```

## Clean up

```
$ docker-compose down --remove-orphans -v
```

## Start the services

```
$ docker-compose up mongo memcached mailer
```

## Seeding

```
$ PROCESSOR='SeedCountry' node src/seeds/load-countries.js
```

## Start web service

```
$ PROCESSOR='Web_Service' node src/public-rest-api/index.js
```

## Start data loader

```
$ PROCESSOR='Data_Loader' node src/data-loading-worker/index.js
```

## Start cronjob

```
$ PROCESSOR='Job_Crontab' node src/job-scheduler/index.js
```

## Public API

```
http://localhost:3000/api/regions
http://localhost:3000/api/daily/United%20Kingdom
http://localhost:3000/api/daily
http://localhost:3000/api/last/day
http://localhost:3000/api/last/week
http://localhost:3000/api/last/month
http://localhost:3000/api/last/alltime
```
