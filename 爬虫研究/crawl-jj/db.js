const mysql = require('mysql');
// 为了让mysql支持promise的写法，所以引用了bluebird
const bluebird = require('bluebird');

// 数据库创建连接
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    database: 'test',
    user: 'root',
    password: ''
});
connection.connect();

// bluebird的promisify方法会直接将connection.query转化成支持promise的语法
module.exports = bluebird.promisify(connection.query).bind(connection);