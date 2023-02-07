"use strict";
const Hapi = require("@hapi/hapi");
const db = require("./db");

const routes=require('./routes')
const server = Hapi.Server({
  host: "localhost",
  port: 4000,
});


server.route(routes);

const init = async () => {
  await server.start();
  console.log("Server running at " + server.info.uri);
};

init();








