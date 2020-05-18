# .env

```
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DB_NAME=covid19
MONGO_INITDB_ROOT_USERNAME=xxx
MONGO_INITDB_ROOT_PASSWORD=xxx

MAILER_SERVER=localhost
MAILER_PORT=25
MAILER_FROM=xxx@example.com
MAILER_TO=xxx@example.com

WS_PORT=3000
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

## Notes

This API can or should work with the API of the original data source provider.

- https://covid19.mathdro.id/api
- https://covid19.mathdro.id/api/daily

# Original Data Source

- https://covid19.mathdro.id/api/countries
- https://covid19.mathdro.id/api/daily
- https://covid19.mathdro.id/api/daily/2020-05-17
