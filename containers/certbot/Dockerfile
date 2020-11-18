FROM certbot/certbot
ARG DOMAIN_NAME
ARG EMAIL_ADDRESS

RUN sudo certbot -n -d ${DOMAIN_NAME} -m ${EMAIL_ADDRESS}
RUN sudo certbot renew --dry-run

ENTRYPOINT ["/bin/sh", "-c"]
CMD ["sleep 9999d"]