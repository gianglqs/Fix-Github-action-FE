# use image
FROM node:18-alpine

# sets the working directory 
WORKDIR /hysteryale-frontend/

ADD ./ /hysteryale-frontend/

ARG RELEASE_TAG
ARG IMAGE_TAG

ENV IMAGE_TAG_ENV=$IMAGE_TAG
ENV RELEASE_TAG_ENV=$RELEASE_TAG

#install and build 
RUN yarn install   
RUN yarn build

# expose the port
EXPOSE 3005

# HEALTHCHECKs
# HEALTHCHECK --interval=30s --timeout=5s \
#   CMD curl -fs http://localhost:3005 || exit 1

CMD ["yarn", "start"]