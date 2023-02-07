const { Worker } = require('bullmq')

const redisConfiguration = {
  connection: {
    host: "localhost",
    port: 49153,
    username: "default",
    password: "redispw"
  }
}

