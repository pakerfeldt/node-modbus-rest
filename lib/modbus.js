'use strict';

const BufferReader = require('h5.buffers').BufferReader;
const h5Modbus = require('h5.modbus');
const ModbusError = require('./errors').ModbusError;

var Modbus = function (options) {
};


Modbus.prototype.openTcp = function (host, port) {
  this.master = h5Modbus.createMaster({
    transport: new h5Modbus.IpTransport({}),
    connection: new h5Modbus.TcpConnection({ socketOptions: { host: host, port: port }}),
    suppressTransactionErrors: false,
    retryOnException: true,
    maxConcurrentRequests: 1,
    defaultUnit: 0,
    defaultMaxRetries: 1,
    defaultTimeout: 1000,
  });
};

Modbus.prototype.readCoils = function (unit, address, quantity, parseDetails) {
  return new Promise(function (fulfill, reject) {
    this._execute(new h5Modbus.ReadCoilsRequest(address, quantity), unit, parseDetails, fulfill, reject);
  }.bind(this));
};

Modbus.prototype.readDiscreteInputs = function (unit, address, quantity, parseDetails) {
  return new Promise(function (fulfill, reject) {
    this._execute(new h5Modbus.ReadDiscreteInputsRequest(address, quantity * parseDetails.length), unit, parseDetails, fulfill, reject);
  }.bind(this));
};

Modbus.prototype.readHoldingRegisters = function (unit, address, quantity, parseDetails) {
  return new Promise(function (fulfill, reject) {
    this._execute(new h5Modbus.ReadHoldingRegistersRequest(address, quantity * parseDetails.length), unit, parseDetails, fulfill, reject);
  }.bind(this));
};

Modbus.prototype.readInputRegisters = function (unit, address, quantity, parseDetails) {
  return new Promise(function (fulfill, reject) {
    this._execute(new h5Modbus.ReadInputRegistersRequest(address, quantity * parseDetails.length), unit, parseDetails, fulfill, reject);
  }.bind(this));
};

Modbus.prototype.writeSingleRegister = function (value, unit, address, quantity, parseDetails) {
  return new Promise(function (fulfill, reject) {
    this._execute(new h5Modbus.WriteSingleRegisterRequest(address, value), unit, parseDetails, fulfill, reject);
  }.bind(this));
};

Modbus.prototype.writeMultipleRegisters = function (value, unit, address, quantity, parseDetails) {
  return new Promise(function (fulfill, reject) {
    var buffer = new Buffer(value, 'base64');
    this._execute(new h5Modbus.WriteMultipleRegistersRequest(address, buffer), unit, parseDetails, fulfill, reject);
  }.bind(this));
};

Modbus.prototype.writeSingleCoil = function (value, unit, address, quantity, parseDetails) {
  return new Promise(function (fulfill, reject) {
    var state = _parseCoilState(value);
    this._execute(new h5Modbus.WriteSingleCoilRequest(address, state), unit, parseDetails, fulfill, reject);
  }.bind(this));
};

Modbus.prototype.writeMultipleCoils = function (value, unit, address, quantity, parseDetails) {
  return new Promise(function (fulfill, reject) {
    var states = _parseCoilStates(value);
    this._execute(new h5Modbus.WriteMultipleCoilsRequest(address, states), unit, parseDetails, fulfill, reject);
  }.bind(this));
};

Modbus.prototype._execute = function (request, unit, parseDetails, fulfill, reject) {
  var transaction = this.master.execute({
    unit: unit,
    retryOnException: true,
    maxRetries: 2,
    timeout: 600,
    request: request,
  });

  transaction.on('error', function (error) {
    reject(error);
  });

  transaction.on('response', function (response) {
    try {
      fulfill(_parseBuffer(response, parseDetails));
    } catch (e) {
      reject(e);
    }
  });
};

var _parseBuffer = function (data, parseDetails) {
  if (data.exceptionCode !== undefined) {
    return data;
  }

  if (data.functionCode === h5Modbus.FunctionCode.WriteSingleCoil
  || data.functionCode === h5Modbus.FunctionCode.WriteMultipleCoils
  || data.functionCode === h5Modbus.FunctionCode.WriteSingleRegister) {
    return data;
  }

  var response = { raw: data };
  if (parseDetails.interpreters.length > 0) {
    var results = [];
    if (parseDetails.kind == 'coil' || parseDetails.kind == 'discrete') {
      for (var i = 0; i < parseDetails.quantity; i++) {
        results.push(_interpret(data.states[i], parseDetails.interpreters));
      }
    } else {
      var registerLength = data.data.length / parseDetails.quantity;
      for (var i = 0; i < parseDetails.quantity; i++) {
        var offset = i * registerLength;
        var reader = new BufferReader(data.data.slice(offset, offset + registerLength));
        results.push(_interpret(reader, parseDetails.interpreters));
      }
    }

    response.values = results;
  }

  return response;
};

var _parseCoilStates = function (input) {
  var states = JSON.parse(input);
  if (!Array.isArray(states)) {
    throw new ModbusError(400, 'Expected array of booleans, got ' + body);
  }

  states.forEach(function (state) {
    if (typeof state !== 'boolean') {
      throw new ModbusError(400, 'Expected array of booleans, got ' + body);
    }
  });

  return states;
};

var _parseCoilState = function (input) {
  var state = JSON.parse(input);
  if (typeof state !== 'boolean') {
    throw new ModbusError(400, 'Coil state should be either true or false');
  }

  return state;
};

var _interpret = function (rawInput, interpreters) {
  var arg = rawInput;
  interpreters.forEach(f => arg = f(arg));
  return arg;
};

var _getOptions = function (unit, parseDetails, fulfill, reject) {
  var options = {
    unit: unit,
    retryOnException: true,
    maxRetries: 2,
    timeout: 600,
  };

  options.onError = function (error) {
    reject(error);
  };

  options.onComplete = function (error, data) {
    if (error !== null) {
      reject(error);
      return;
    }

    try {
      fulfill(_parseBuffer(data, parseDetails));
    } catch (e) {
      reject(e);
    }
  };

  return options;
};

module.exports = Modbus;
