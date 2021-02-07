FROM postgres:12
ARG PGUSER
ARG PGPASSWORD
ARG PGDATABASE
ARG PGHOST
ARG PGPORT
ENV PGUSER=${PGUSER}
ENV PGHOST=${PGHOST}
ENV PGPORT=${PGPORT}
ENV PGDATABASE=${PGDATABASE}
ENV PGPASSFILE=~/.pgpass

RUN echo "${PGHOST}:${PGPORT}:${PGDATABASE}:${PGUSER}:${PGPASSWORD}" >> ~/.pgpass

RUN chmod 0600 ~/.pgpass

COPY wait-for-it.sh /usr/local/wait-for-it.sh

CMD /usr/local/wait-for-it.sh ${PGHOST}:${PGPORT} --\
    psql -U ${PGUSER} -h ${PGHOST} -d postgres -c "create database ${PGDATABASE};";\
    psql -U ${PGUSER} -h ${PGHOST} -c "create table gpudb();";\
    psql -U ${PGUSER} -h ${PGHOST} -c "create table gpulist(name TEXT, relative DOUBLE PRECISION);";\
    psql -U ${PGUSER} -h ${PGHOST} -c "create table lastupdate();";\
    psql -U ${PGUSER} -h ${PGHOST} -c "\dt;"
