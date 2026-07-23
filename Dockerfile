FROM ghost:6-alpine

USER root
RUN mkdir -p /var/lib/ghost/content/themes/dawn \
    && chown -R node:node /var/lib/ghost/content
USER node
