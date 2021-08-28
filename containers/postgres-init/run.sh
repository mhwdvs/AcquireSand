#!/usr/bin/env bash

# create database if it doesn't already exist
psql -U ${PGUSER} -h ${PGHOST} -d postgres -c "create database ${PGDATABASE};"

# destroy tables if they exist
psql -U ${PGUSER} -h ${PGHOST} -c "drop table gpulist;"
psql -U ${PGUSER} -h ${PGHOST} -c "drop table gpudb;"
psql -U ${PGUSER} -h ${PGHOST} -c "drop table lastupdate;"

# create tables if they don't already exist
psql -U ${PGUSER} -h ${PGHOST} -c "create table gpulist(name TEXT, relative DOUBLE PRECISION, PRIMARY KEY (name));"
psql -U ${PGUSER} -h ${PGHOST} -c "create table gpudb(title TEXT, gpu TEXT, itemurl TEXT, imageurl TEXT, price MONEY, currency TEXT, available BOOLEAN, PRIMARY KEY (itemurl), CONSTRAINT fk_gpuname FOREIGN KEY(gpu) REFERENCES gpulist(name));"
psql -U ${PGUSER} -h ${PGHOST} -c "create table lastupdate();"

sleep 5

# create a dummy gpudb entry
psql -U ${PGUSER} -h ${PGHOST} -c "insert into gpudb (title, gpu, itemurl, imageurl, price, currency, available) values ('Test GPU!', (select name from gpulist where name='NVIDIA GeForce RTX 3080'), 'https://i.ytimg.com/an_webp/8ZtW1ziF9u0/mqdefault_6s.webp?du=3000&sqp=CPSeqIkG&rs=AOn4CLBEymM6gwmpYRwYrQrN6T2mgwud_A', 'https://cdn.frankerfacez.com/emoticon/130077/4', 777.77, 'AUD', true);"

# display tables in database
while true 
do
    psql -U ${PGUSER} -h ${PGHOST} -c "\dt;"
    psql -U ${PGUSER} -h ${PGHOST} -c "select * from gpudb"
    psql -U ${PGUSER} -h ${PGHOST} -c "select * from gpulist"
    psql -U ${PGUSER} -h ${PGHOST} -c "select * from lastupdate"
    sleep 10
done
