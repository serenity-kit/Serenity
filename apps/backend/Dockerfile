FROM ubuntu:latest

# FROM node:18

# Create app directory
WORKDIR /usr/src/app

COPY . .

RUN apt update
# install curl 
RUN apt install curl -y
# get install script and pass it to execute: 
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash
# and install node 
RUN apt install nodejs
RUN apt install libssl-dev

RUN echo "WEEEEEE"
RUN openssl version -a

EXPOSE $PORT
CMD ["npm", "run", "start:prod" ]