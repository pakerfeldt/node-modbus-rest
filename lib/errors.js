'use strict';

function ModbusError(httpstatus, message) {
  this.name = 'ModbusError';
  this.message = (message || '');
  this.httpstatus = httpstatus || 500;
}

ModbusError.prototype = Error.prototype;

function InterpretError(message) {
  this.name = 'InterpretError';
  this.message = (message || '');
}

InterpretError.prototype = Error.prototype;

module.exports.ModbusError = ModbusError;
module.exports.InterpretError = InterpretError;
