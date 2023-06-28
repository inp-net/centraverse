FROM node:18
WORKDIR /app
COPY . /app/

RUN yarn install
RUN chmod +x /app/entrypoint.sh
ENTRYPOINT [ "/app/entrypoint.sh" ]