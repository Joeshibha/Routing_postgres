const db = require("../db");

module.exports.getallbooks = async (req, h) => {
  try {
    const results = await db.query("SELECT * FROM book");
    return h.response(results.rows).code(200);
  } catch (err) {
    return h.response({ error: 'Error fetching books' }).code(500);
  }
};

module.exports.getonebook = async (req, h) => {
  try {
    const bookid = req.params.bookid
    const results=await db.query("SELECT * FROM book WHERE bookid = $1", [bookid]);
    return h.response(results.rows).code(200)
  } catch (err) {
    return h.response({ error: 'Error fetching the book' }).code(500);
  }
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
      console.log(bookname,
        publishername,
        category,
        copies,
        rating,
        published_date,
        authorid)
      const results= await db.query(
        "insert into book(bookname, publishername,category,copies,rating,published_date,authorid)VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *",
        [
          bookname,
          publishername,
          category,
          copies,
          rating,
          published_date,
          authorid
        ]
      );
      console.log(bookname,
        publishername,
        category,
        copies,
        rating,
        published_date,
        authorid)
      return h.response(results.rows).code(201)
  } catch (err) {
    return h.response({ error: 'Error creating book details' }).code(500);
  }
};
module.exports.putbook = async (req, h) => {
  try {
    const bookid = req.params.bookid;
    const {bookname} = req.payload;

    const results= await db.query(
      "UPDATE book SET bookname=$1 WHERE bookid=$2 RETURNING *",
      [bookname, bookid]
    );
    return h.response(results.rows).code(200)
  } catch (err) {
    return h.response({ error: 'Error updating book details' }).code(500);
  }
};
module.exports.deletebook = async (req, h) => {
  try {
    const bookid = req.params.bookid;
    const results= await db.query("DELETE FROM book WHERE bookid = $1 RETURNING *", [
      bookid
    ]);
    return h.response(results.rows).code(200)
  } catch (err) {
    return h.response({ error: 'Error deleting book data' }).code(500);
  }
};
