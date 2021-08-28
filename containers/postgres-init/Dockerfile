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
COPY run.sh /usr/local/run.sh

CMD /usr/local/wait-for-it.sh ${PGHOST}:${PGPORT} -- /usr/local/run.sh
