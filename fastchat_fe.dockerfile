FROM node:9 as builder
COPY . /building
WORKDIR /building
RUN yarn install && yarn build

FROM nginx
COPY --from=builder /building/dist /fe_static
COPY ./fe_static_nginx_config/default.conf /etc/nginx/conf.d/default.conf