const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'personal_blog', // make sure this DB exists
  password: 'abc123456', // replace with your actual password
  port: 5432,
});

client.connect()
  .then(() => {
    console.log("✅ Connected! Password and DB are correct.");
    client.end();
  })
  .catch(err => {
    console.error("❌ Connection failed:", err.message);
  });