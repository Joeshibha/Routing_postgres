
const pg = require('pg')
const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "newdb",
  password: "Joeshibha@2002",
  port: 5432,
})

module.exports={
    query:(text,params)=>pool.query(text,params)
}