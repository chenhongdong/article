const mysql = require('mysql');
const bluebird = require('bluebird');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    database: 'hotnews',
    user: 'root',
    password: ''
});

connection.connect();

module.exports = bluebird.promisify(connection.query).bind(connection);