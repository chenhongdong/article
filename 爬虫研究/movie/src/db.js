const mysql = require('mysql');
const bluebird = require('bluebird');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    database: 'my_movie',
    user: 'root',
    password: ''
});
connection.connect();

module.exports = bluebird.promisify(connection.query).bind(connection);