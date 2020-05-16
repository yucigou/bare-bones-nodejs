# .env

```
MONGO_INITDB_ROOT_USERNAME=xxx
MONGO_INITDB_ROOT_PASSWORD=xxx
```

# MongoDB

https://hub.docker.com/_/mongo

```
$ docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                    NAMES
295dbd867cc0        mongo               "docker-entrypoint.s…"   21 minutes ago      Up 21 minutes       27017/tcp                mongodb_mongo_1

$ docker exec -it 295dbd867cc0 bash
# mongo -u root -p example
> use stem
> show collections
> db.courses.findOne()
> db.courses.find()
```

## Robo 3T

```
db.getCollection('countries').find({})
db.getCollection('countries').find({iso2: "US"})
db.getCollection('countries').find({"iso2": "US"})

db.getCollection('countries').remove({})
db.countries.remove({})

db.getCollection('countries').drop()

db.getCollection('countries').stats()
```
