FROM ubuntu:latest

# FROM node:18

# Create app directory
WORKDIR /usr/src/app

COPY . .

RUN apt-get update
# install curl 
RUN apt-get install curl
# get install script and pass it to execute: 
RUN curl -sL https://deb.nodesource.com/setup_4.x | bash
# and install node 
RUN apt-get install nodejs

EXPOSE $PORT
CMD ["npm", "run", "start:prod" ]