#!/usr/bin/env bash

# create database if it doesn't already exist
psql -U ${PGUSER} -h ${PGHOST} -d postgres -c "create database ${PGDATABASE};"

# create tables if they don't already exist
psql -U ${PGUSER} -h ${PGHOST} -c "create table gpudb(title TEXT, gpu TEXT, itemurl TEXT, imageurl TEXT, price MONEY, currency TEXT, available BOOLEAN);"
psql -U ${PGUSER} -h ${PGHOST} -c "create table gpulist(name TEXT, relative DOUBLE PRECISION);"
psql -U ${PGUSER} -h ${PGHOST} -c "create table lastupdate();"

# display tables in database
while true 
do
    psql -U ${PGUSER} -h ${PGHOST} -c "\dt;"
    psql -U ${PGUSER} -h ${PGHOST} -c "select * from gpudb"
    psql -U ${PGUSER} -h ${PGHOST} -c "select * from gpulist"
    psql -U ${PGUSER} -h ${PGHOST} -c "select * from lastupdate"
    sleep 10
done
