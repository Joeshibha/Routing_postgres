const Hapi = require("@hapi/hapi");
const Bull = require("bull");
const IORedis =require("ioredis")
const connection=new IORedis()

module.exports.mail = async (req, h) => {
  const queue = new Bull('Paint',{connection});
  
  //await queue.add({ name: 'cars', data: { color: 'blue' } }, { delay: 5000 });
  await queue.add(
    { name: 'cars', data: { color: 'blue' } },
    {
      repeat: {
        every: 5000,
        limit: 10
      }
    }
  );
  
  const worker = queue.process(async job => {
    if (job.name === 'pink') {
      await paintCar(job.data.color);
      
    }
  });
  
  queue.on('completed', (job) => {
    console.log(`Job with id ${job.id} has completed.`)
  });
  queue.on('failed', (job, error) => {
    console.error(`Job with id ${job.id} has failed with error: ${error.message}.`);
  });
  return new Promise((resolve, reject) => {
    worker.then(() => {
      resolve();
    }).catch(err => {
      reject(err);
    });
  });
};