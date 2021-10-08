FROM certbot/certbot
ARG DOMAIN_NAME
ARG EMAIL_ADDRESS

RUN certbot -n certonly --standalone -d ${DOMAIN_NAME} -m ${EMAIL_ADDRESS}
RUN certbot renew --dry-run

ENTRYPOINT ["/bin/sh", "-c"]
CMD ["sleep 9999d"]