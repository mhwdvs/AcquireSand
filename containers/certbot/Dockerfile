FROM certbot/certbot
ARG DOMAIN_NAME
ARG EMAIL_ADDRESS

RUN certbot -n -v certonly --standalone -d ${DOMAIN_NAME} -m ${EMAIL_ADDRESS} --agree-tos
RUN certbot renew --dry-run

ENTRYPOINT ["/bin/sh", "-c"]
CMD ["sleep 9999d"]