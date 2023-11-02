#!/bin/bash

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"

if [ "$1" == "postgres" ]; then
  docker-compose -p postgres-stack-compose -f $SCRIPT_DIR/docker-compose-postgres.yml up -d
elif [ "$1" == "mongo" ]; then
  rm -rf $SCRIPT_DIR/mongo-init-scripts 
  rm -rf $SCRIPT_DIR/mongo-keyfile
  openssl rand -base64 741 > $SCRIPT_DIR/mongo-keyfile
  chmod 600 $SCRIPT_DIR/mongo-keyfile
  mkdir $SCRIPT_DIR/mongo-init-scripts
  echo "db.createUser({ user: 'kanban', pwd: 'kanban', roles: [{role: 'readWrite',db: 'kanban'}]});" > $SCRIPT_DIR/mongo-init-scripts/init-mongo.js 
  echo "db = db.getSiblingDB('kanban');" >> $SCRIPT_DIR/mongo-init-scripts/init-mongo.js 
  echo "db.createCollection('myCollection');" >> $SCRIPT_DIR/mongo-init-scripts/init-mongo.js 
  docker-compose -p mongo-stack-compose -f $SCRIPT_DIR/docker-compose-mongo.yml up -d
  echo "Waiting for MongoDB to start..."
  sleep 10
  echo "MongoDB is up and ready to use. Proceeding with authentication..."
  docker exec mongo-rs0 mongosh -u root -p root --eval 'config = {"_id": "rs0", "members": [{"_id": 0, "host": "localhost:27017"}]}; rs.initiate(config);'

else
  echo "No database selected or invalid database specified, please indicate postgres or mongo !"
fi