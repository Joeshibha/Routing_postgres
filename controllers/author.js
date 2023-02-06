const db = require("../db");
const Hapi = require("@hapi/hapi");
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
  
  const results = await db.query("SELECT * FROM author WHERE authorid = $1", [
    authorid,
  ]);
  return h.response(results.rows).code(200);
};

module.exports.postauthor = async (req, h) => {
  const { authorname, authoraddress, authorphone } = req.payload;
  try {
    const results = await db.query(
      "insert into author(authorname, authoraddress, authorphone)VALUES($1,$2,$3) RETURNING *",
      [authorname, authoraddress, authorphone]
    );
    return h.response(results.rows).code(201);
  } catch (err) {
    return h.response({ error: "Error creating user" }).code(500);
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
