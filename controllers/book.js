const db = require("../db");
const DEFAULT_EXPIRATION = 3600;
const redis = require("redis");
const client = redis.createClient();
client.on("connect", () => console.log("Connected to REDIS!"));
client.on("error", (err) => console.log("Error connecting to REDIS: ", err));
client.connect();

module.exports.getallbooks = async (req, h) => {
  try {
    const results = await db.query("SELECT * FROM book");
    return results.rows;
  } catch (err) {
    return { error: "Error fetching books" };
  }
};

module.exports.getonebook = async (req, h) => {
  const bookid = req.params.bookid;
  const books = await getOrSetCache(`books:${bookid}`, async () => {
    const results = await db
      .query("SELECT * FROM book WHERE bookid = $1", [bookid])
      .catch(console.error);
    return results.rows;
  });
  return books;
};
module.exports.postbook = async (req, h) => {
  try {
    const {
      bookname,
      publishername,
      category,
      copies,
      rating,
      published_date,
      authorid,
    } = req.payload;
    console.log(
      bookname,
      publishername,
      category,
      copies,
      rating,
      published_date,
      authorid
    );
    const results = await db.query(
      "insert into book(bookname, publishername,category,copies,rating,published_date,authorid)VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *",
      [
        bookname,
        publishername,
        category,
        copies,
        rating,
        published_date,
        authorid,
      ]
    );
    console.log(
      bookname,
      publishername,
      category,
      copies,
      rating,
      published_date,
      authorid
    );
    return h.response(results.rows).code(201);
  } catch (err) {
    return h.response({ error: "Error creating book details" }).code(500);
  }
};
module.exports.putbook = async (req, h) => {
  try {
    const bookid = req.params.bookid;
    const   {bookname} = req.payload;

    const results = await db.query(
      "UPDATE book SET bookname=$1 WHERE bookid=$2 RETURNING *",
      [bookname, bookid]
    );
    client.del(`books:${bookid}`);
    return h.response(results.rows).code(200);
  } catch (error) {
    console.log(error);
    return h.response({ error: error.message }).code(500);
  }
};
module.exports.deletebook = async (req, h) => {
  try {
    const bookid = req.params.bookid;
    const results = await db.query(
      "DELETE FROM book WHERE bookid = $1 RETURNING *",
      [bookid]
    );
    return h.response(results.rows).code(200);
  } catch (err) {
    return h.response({ error: error.message }).code(500);
  }
};

function getOrSetCache(key, cb) {
  return new Promise(async (resolve, reject) => {
    const cachedData = await client.get(key);
    if (cachedData != null) {
      console.log('Data from redis ', cachedData);
      resolve(JSON.parse(cachedData));
    }else{
      const freshData = await cb();
      console.log('Data from DB ');
      await client.setEx(key, DEFAULT_EXPIRATION, JSON.stringify(freshData));
      resolve(freshData);
    }
  });
}

