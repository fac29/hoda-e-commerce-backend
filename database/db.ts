const { readFileSync: readSchemaFileSync } = require('node:fs');
const { join: pathJoin } = require('node:path');
const Database = require('better-sqlite3');
require('dotenv').config();

const db = new Database(process.env.DB_FILE);
console.log('Database connected successfully.');

const schemaPath = pathJoin('database', 'schema.sql');
const schema = readSchemaFileSync(schemaPath, 'utf-8');
db.exec(schema);

module.exports = db;
