"use strict";
const Hapi = require("@hapi/hapi");
const server = Hapi.Server({
  host: "localhost",
  port: 4000,
});
const init = async () => {
  await server.start();
  console.log("Server running at " + server.info.uri);
};

init();

const Pool = require("pg").Pool;
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "newdb",
  password: "Joeshibha@2002",
  port: 5432,
});

server.route({
  method: "GET",
  path: "/api/v1/books",
  handler: async(req,h) => {
    const results=await pool.query("SELECT * FROM book")
    return h.response(results.rows).code(200)
      }
    
  });

server.route({
  method: "GET",
  path: "/api/v1/books/{bookid}",
  handler: async(req,h) => {
    const bookid = req.params.bookid
    const results=await pool.query("SELECT * FROM book WHERE bookid = $1", [bookid]);
    return h.response(results.rows).code(200)
  },
});
server.route({
  method: "POST",
  path: "/api/v1/books",
  handler: async(req, h) => {
    const {
      bookname,
      publishername,
      category,
      copies,
      rating,
      published_date,
      authorid,
    } = req.payload;
    const results= await pool.query(
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
    return h.response(results.rows).code(201)
  },
});
server.route({
  method: "PUT",
  path: "/api/v1/books/{bookid}",
  handler: async(req, h) => {
    const bookid = req.params.bookid;
    const { bookname } = req.payload;

    const results= await pool.query(
      "UPDATE book SET bookname=$1 WHERE bookid=$2 RETURNING *",
      [bookname, bookid]
    );
    return h.response(results.rows).code(200)
  },
});

server.route({
  method: "DELETE",
  path: "/api/v1/books/{bookid}",

  handler: async(req,h) => {
    const bookid = req.params.bookid;
    const results= await pool.query("DELETE FROM book WHERE bookid = $1 RETURNING *", [
      bookid
    ]);
    return h.response(results.rows).code(200)
  },
});

//authors table
server.route({
  method: "GET",
  path: "/api/v1/authors",
  handler: async(req,h) => {
    const results=await pool.query("SELECT * FROM author ORDER BY authorid ASC")
    return h.response(results.rows).code(200)
      }
    
  });

server.route({
  method: "GET",
  path: "/api/v1/authors/{authorid}",
  handler: async(req,h) => {
    const authorid = req.params.authorid
    const results=await pool.query("SELECT * FROM author WHERE authorid = $1", [authorid]);
    return h.response(results.rows).code(200)
  },
});
server.route({
  method: "POST",
  path: "/api/v1/authors",
  handler: async(req, h) => {
    const {
      authorname,
      authoraddress,
      authorphone,
      
    } = req.payload;
    const results= await pool.query(
      "insert into author(authorname, authoraddress, authorphone)VALUES($1,$2,$3) RETURNING *",
      [
      authorname,
      authoraddress,
      authorphone,
      ]
    );
    return h.response(results.rows).code(201)
  },
});
server.route({
  method: "PUT",
  path: "/api/v1/authors/{authorid}",
  handler: async(req, h) => {
    const authorid = req.params.authorid;
    const { authoraddress,authorphone } = req.payload;
    const results= await pool.query(
      "UPDATE author SET authoraddress=$1, authorphone=$2 WHERE authorid=$3 RETURNING *",
      [authoraddress,authorphone, authorid]
    );
    return h.response(results.rows).code(200)
  },
});
server.route({
  method: "DELETE",
  path: "/api/v1/authors/{authorid}",

  handler: async(req,h) => {
    const authorid = req.params.authorid;
    const results= await pool.query("DELETE FROM author WHERE authorid = $1 RETURNING *", [
      authorid
    ]);
    return h.response(results.rows).code(200)
  },
});


/* //Relationships
server.route({
  method: "GET",
  path: "/api/v1/authors/relations/{authorid}",
  handler: async(req,h) => {
    const authorid = req.params.authorid
    const results=await pool.query("SELECT * FROM book INNER JOIN author ON book.authorid=author.authorid WHERE author.authorid=$1", [authorid]);
    return h.response(results.rows).code(200)
  },
}); */

server.route({
  method: "GET",
  path: "/api/v1/authors/relations/{authorname}",
  handler: async(req,h) => {
    const authorname = req.params.authorname
    const results=await pool.query("SELECT * FROM book WHERE authorid IN(SELECT authorid FROM author WHERE authorname = $1)", [authorname]);
    return h.response(results.rows).code(200)
  },
});