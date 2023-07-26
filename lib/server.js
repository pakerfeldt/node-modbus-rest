'use strict';

const routes = require('./routes');
const Modbus = require('./modbus');

var start = function (options) {
  var port = options.port || 20900;
  var baudrate = options.baudrate || 9600;
  var parity = options.parity || 'none';
  var slaveHost = options.host || false;
  var slavePort = options.slaveport || 502;

  var modbus = new Modbus();

  } if (slaveHost !== false) {
    modbus.openTcp(slaveHost, slavePort);
  } else {
    console.log('Need to specify at least --serial or --host');
    return;
  }

  var app = require('express')();
  app.listen(port);
  routes.setup(app, modbus);
  console.log('Listening on port ' + port);
}

module.exports.start = start;
