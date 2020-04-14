const mysql = require('mysql');
const bluebird = require('bluebird');

let connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    database: 'spider',
    user: 'root',
    password: ''
});

connection.connect();


module.exports = bluebird.promisify(connection.query).bind(connection);