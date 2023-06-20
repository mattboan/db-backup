# Database Backup Service

## Overview

Just a simple node.js application that connects to a mysql docker container and dumps just the data, then it uploads the data to supabase.

## Init it

First up you'll need to set the environemnt files:

```bash
touch .env
```

Fill it in.

```
DATABASE_URL=
DATABASE=
DATABASE_USER=
DATABASE_PW=
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_BUCKET_NAME=
CRON_TIME=
```

Next edit the docker-compose file, in this instance i've made it apart of the madmen network from another project, just either remove that or change to the network your using.

```yaml
version: '3'
services:
    app:
        build:
            context: .
            dockerfile: Dockerfile
        networks:
            - <CHANGE_ME>
        restart: always
        env_file:
            - .env

networks:
    <CHANGE_ME>:
        external: true
```

## Run it

To run it:

```bash
docker-compose up -d
```

## Log it

In case you want to log out the results to see if its working:

```bash
docker logs <container-id> --follow
```
