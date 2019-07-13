FROM node:11 as build

RUN mkdir /src
COPY . /src
WORKDIR /src
RUN yarn install
RUN yarn build

FROM httpd:2.4

COPY ./httpd.conf /usr/local/apache2/conf/httpd.conf
COPY --from=build /src/build/ /usr/local/apache2/htdocs/
