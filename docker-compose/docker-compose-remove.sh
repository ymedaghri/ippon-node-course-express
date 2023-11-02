#!/bin/bash

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"

if [ "$1" == "postgres" ]; then
  docker-compose -p postgres-stack-compose -f $SCRIPT_DIR/docker-compose-postgres.yml stop && docker-compose -p postgres-stack-compose -f $SCRIPT_DIR/docker-compose-postgres.yml rm
elif [ "$1" == "mongo" ]; then
  docker-compose -p mongo-stack-compose -f $SCRIPT_DIR/docker-compose-mongo.yml stop && docker-compose -p mongo-stack-compose -f $SCRIPT_DIR/docker-compose-mongo.yml rm  
else
  echo "No database selected or invalid database specified, please indicate postgres or mongo !"
fi