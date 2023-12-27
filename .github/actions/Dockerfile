# use image
FROM node:18-alpine

# sets the working directory 
WORKDIR /hysteryale-frontend/

# copy source code
# COPY public/ /hysteryale-frontend/public
# COPY src/ /hysteryale-frontend/src
# COPY package.json /hysteryale-frontend/
# COPY .env /hysteryale-frontend/
# COPY tsconfig.json /hysteryale-frontend/
ADD ./ /hysteryale-frontend/

# set env variable
#ENV NEXT_PUBLIC_BACKEND_URL

#install and build 
RUN yarn install   
RUN yarn build

# expose the port
EXPOSE 3005

# HEALTHCHECKs
# HEALTHCHECK --interval=30s --timeout=5s \
#   CMD curl -fs http://localhost:3005 || exit 1

CMD ["yarn", "start"]