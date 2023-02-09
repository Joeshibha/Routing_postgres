const db = require("../db");
const elasticsearch = require("elasticsearch")
const esClient = elasticsearch.Client({
  host: "http://127.0.0.1:9200",
})
async function syncData() {
  try {
    const result = await db.query('SELECT * FROM author');
    //console.log('Data from Postgres:', result.rows);

    for (const a of result.rows) {
      
      const exists = await esClient.exists({
        index: 'elastic',
        id:a.authorid,
      });
      if (!exists) {
      esClient.index({
        index: 'elastic',
        id: a.authorid,
        body: a,
      })
    }
    else{
      esClient.update({
        index: 'elastic',
        id: a.authorid,
        body: {
          doc: a
        }
      });
    }
  }
    console.log('Data synchronized with Elasticsearch');
  } catch (error) {
    console.error('Error synchronizing data:', error);
  }
}

setInterval(syncData, 5000);




module.exports.getallauthor = async (req, h) => {
  try {
    
      const results = await db.query("SELECT * FROM author ORDER BY authorid ASC").catch(console.error);
      return results.rows;
  

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
    ).catch(console.error)
    esClient.delete({
      index: 'elastic',
      id: authorid
    });
    console.log("Data deleted in ES")
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

/* module.exports.ecreate = async (req, h) => {
  try {
    const { authorname, authoraddress, authorphone } = req.payload;

    await esClient.index({
      index: 'eauthors',
      body: {
        authorname,
        authoraddress,
        authorphone,
      },
    });
    return h.response({ message: 'Indexing successful' }).code(200);
  } catch (error) {
    return h.response({ message: 'Error' }).code(500);
  }
}; */

module.exports.esearch = async (req, h) => {
  try {
    const authorname = req.query.authorname;
    const response = await esClient.search({
      index: 'elastic',
      body: {
        query: {
          match: { "authorname":authorname },
        },
      },
    });
    return h.response(response).code(200);
  } catch (error) {
    console.log(error);
    return h.response({ message: 'Error' }).code(500);
  }
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
