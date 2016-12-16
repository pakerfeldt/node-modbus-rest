'use strict';

const InterpretError = require('./errors').InterpretError;

module.exports = {

  raw: function (input) {
    return input;
  },

  default: function (input) {
    if (typeof input === 'boolean') {
      return require('./interpreters').boolean(input);
    } else if (typeof input === 'object' && Buffer.isBuffer(input.buffer)) {
      return require('./interpreters').integer(input);
    } else {
      return input;
    }
  },

  boolean: function (bool) {
    return bool;
  },

  integer: function (reader) {
    if (typeof reader !== 'object' || !Buffer.isBuffer(reader.buffer)) {
      throw new InterpretError('"integer" - Unexpected input argument. Can only interpret raw buffer.');
    }

    if (reader.length == 1) {
      return reader.readInt8(0);
    } else if (reader.length == 2) {
      return reader.readInt16(0);
    } else if (reader.length == 4) {
      return reader.readInt32(0);
    } else {
      throw new InterpretError('"integer" - Unsupported length of data: ' + reader.length);
    }
  },

  tenths: function (input) {
    if (typeof input === 'object' && Buffer.isBuffer(input.buffer)) {
      return require('./interpreters').integer(input) / 10;
    } else if (integer === parseInt(integer, 10)) {
      return input / 10;
    }

    throw new InterpretError('"tenths" - Unexpected input argument. Expected integer or raw buffer.');
  },

  float32: function (reader) {
    if (typeof reader !== 'object' || !Buffer.isBuffer(reader.buffer)) {
      throw new InterpretError('"float32" - Unexpected input argument. Can only interpret raw buffer.');
    } else if (reader.length !== 4) {
      throw new InterpretError('"float32" - Unexpected size of buffer reader. Expected 4, got ' + reader.length + ".");
    }

    try {
      return reader.readFloat(0, false);
    } catch (error) {
      throw new InterpretError('"float32" - ' + error.message);
    }
  },

  float32le: function (reader) {
    if (typeof reader !== 'object' || !Buffer.isBuffer(reader.buffer)) {
      throw new InterpretError('"float32le" - Unexpected input argument. Can only interpret raw buffer.');
    } else if (reader.length !== 4) {
      throw new InterpretError('"float32le" - Unexpected size of buffer reader. Expected 4, got ' + reader.length + ".");
    }

    try {
      return reader.readFloat(0, true);
    } catch (error) {
      throw new InterpretError('"float32le" - ' + error.message);
    }
  },
};
