const Hapi = require("@hapi/hapi");
const { Queue, Worker, QueueEvents } = require("bullmq");
const IORedis =require("ioredis")
const connection=new IORedis()

module.exports.mail = async (req, h) => {
  const queue = new Queue("Paint",{connection});

  await queue.add("cars", { color: "blue" });
  const worker = new Worker("Paint", async (job) => {
    if (job.name === "cars") {
      await paintCar(job.data.color);
      console(job.data.color)
    }
  });
  //const queueEvents = new QueueEvents("Paint");

  worker.on("completed", (job) => {
    return `Job with id ${job.id} has completed.`
  });

  worker.on(
    "failed",
    (job,error) => {
      return `Job with id ${job.id} has failed with error: ${error.message}.`
    }
  );
  return `MQ`;
};


