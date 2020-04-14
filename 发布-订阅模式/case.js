let EventEmitter = require('./EventEmitter');
let util = require('util');

function Girl() {

}

util.inherits(Girl, EventEmitter);
let girl = new Girl();
let drink = function() {
    console.log('喝酒');
};
let play = function() {
    console.log('玩');
};

girl.once('开心', drink);
girl.on('开心', play);
girl.removeListener('开心', play)

girl.emit('开心');
girl.emit('开心');
girl.emit('开心');