const db = require("../db");
const Hapi = require("@hapi/hapi");
const DEFAULT_EXPIRATION = 3600;
const redis = require("redis");
const client = redis.createClient();
client.on("connect", () => console.log("Connected to REDIS!"));
client.on("error", (err) => console.log("Error connecting to REDIS: ", err));
client.connect();



module.exports.getallauthor = async (req, h) => {
  try {
    const authors = await getOrSetCache("authors", async () => {
      const results = await db.query("SELECT * FROM author ORDER BY authorid ASC").catch(console.error);
      return results.rows;
    });
    return authors
  } catch (error) {
    console.error(error);
    return h.response({ error: error.message }).code(500);
  }
};

module.exports.getoneauthor = async (req, h) => {
  const authorid = req.params.authorid;
  try{const authors = await getOrSetCache(`authors:${authorid}`, async () => {
    const results = await db.query("SELECT * FROM author WHERE authorid = $1", [
      authorid,
    ]).catch(console.error);
    return results.rows;
  });
  return authors}
  catch(err){
    return h.response({ error: error.message }).code(500);
  }
    }

module.exports.postauthor = async (req, h) => {
  const { authorname, authoraddress, authorphone } = req.payload;
  try {
    const results = await db.query(
      "insert into author(authorname, authoraddress, authorphone)VALUES($1,$2,$3) RETURNING *",
      [authorname, authoraddress, authorphone]
    );
    return h.response(results.rows).code(201);
  } catch (err) {
    return h.response({ error: error.message }).code(500);
  }
};

module.exports.putauthor = async (req, h) => {
  const  authorid  = req.params.authorid;
  const { authoraddress, authorphone } = req.payload 
  console.log(authoraddress, authorphone, authorid)
    const results = await db.query(
      "UPDATE author SET authoraddress=$1, authorphone=$2 WHERE authorid=$3 RETURNING *",
      [authoraddress, authorphone, authorid]
    );
    
    return h.response(results.rows).code(200);
  
};

module.exports.deleteauthor = async (req, h) => {
    const authorid = req.params.authorid;
    const results = await db.query(
      "DELETE FROM author WHERE authorid=$1 RETURNING *",
      [authorid]
    );
    console.log(authorid);
    return h.response(results.rows).code(200);
};

module.exports.getresults = async (req, h) => {
  const authorname = req.params.authorname;
  const results = await db.query(
    "SELECT * FROM book WHERE authorid IN(SELECT authorid FROM author WHERE authorname = $1)",
    [authorname]
  );
  return h.response(results.rows).code(200);
};

/* module.exports.getjoinresults = async (req, h) => {
  const authorid = req.params.authorid;
  const results = await db.query(
    "SELECT * FROM book INNER JOIN author ON book.authorid=author.authorid WHERE author.authorid=$1",
    [authorid]
  );
  return h.response(results.rows).code(200);
};
 */
function getOrSetCache(key, cb) {
  return new Promise(async (resolve, reject) => {
   const data = await client.get(key).catch(console.error);
    if (data != null){
      resolve(JSON.parse(data))
    }
    const freshData = await cb().catch(console.error);
    await client.setEx(key, DEFAULT_EXPIRATION, JSON.stringify(freshData)).catch(console.error);
    resolve(freshData);
    
  });
}