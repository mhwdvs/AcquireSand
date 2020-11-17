FROM ubuntu:groovy
ARG DOMAIN_NAME
ARG EMAIL_ADDRESS

# install certbot
RUN sudo snap install --classic certbot
RUN sudo ln -s /snap/bin/certbot /usr/bin/certbot
# get cert
RUN sudo certbot -n -d ${DOMAIN_NAME} -m ${EMAIL_ADDRESS}
RUN sudo certbot renew --dry-run

# keep alive
CMD tail -f /dev/null