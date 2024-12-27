#!/bin/bash

DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

export PGPASSWORD=$DB_PASSWORD

query="DELETE FROM urls WHERE expires_at >= "
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT NOW();"
echo "Executed query at $(date)" >> /var/log/cron_output.log