'use strict';

const interpreters = require('./interpreters');
const ModbusError = require('./errors').ModbusError;
const bodyParser = require('body-parser');

var setup = function (app, modbus) {

  app.use(bodyParser.text({
    type: (req) => true
  }));
  app.get('/:unit/coil/:address', (req, res) => {
    req.params.quantity = 1;
    return _request(modbus.readCoils.bind(modbus), 'coil', req, res);
  });

  app.get('/:unit/coil/:address/:quantity', (req, res) =>
    _request(modbus.readCoils.bind(modbus), 'coil', req, res)
  );

  app.post('/:unit/coil/:address/', (req, res) =>
    _request(_partial(modbus.writeSingleCoil, req.body).bind(modbus), 'coil', req, res)
  );

  app.post('/:unit/coil/:address/:quantity', (req, res) =>
    _request(_partial(modbus.writeMultipleCoils, req.body).bind(modbus), 'coil', req, res)
  );

  app.get('/:unit/discrete/:address', (req, res) => {
    req.params.quantity = 1;
    return _request(modbus.readDiscreteInputs.bind(modbus), 'discrete', req, res);
  });

  app.get('/:unit/discrete/:address/:quantity', (req, res) =>
    _request(modbus.readDiscreteInputs.bind(modbus), 'discrete', req, res)
  );

  app.get('/:unit/holding/:address', (req, res) => {
    req.params.quantity = 1;
    return _request(modbus.readHoldingRegisters.bind(modbus), 'holding', req, res);
  });

  app.get('/:unit/holding/:address/:quantity', (req, res) =>
    _request(modbus.readHoldingRegisters.bind(modbus), 'holding', req, res)
  );

  app.post('/:unit/holding/:address', (req, res) =>
    _request(_partial(modbus.writeSingleRegister, req.body).bind(modbus), 'holding', req, res)
  );

  app.post('/:unit/holding/:address/:quantity', (req, res) =>
    _request(_partial(modbus.writeMultipleRegisters, req.body).bind(modbus), 'holding', req, res)
  );

  app.get('/:unit/input/:address', (req, res) => {
    req.params.quantity = 1;
    return _request(modbus.readInputRegisters.bind(modbus), 'input', req, res);
  });

  app.get('/:unit/input/:address/:quantity', (req, res) =>
    _request(modbus.readInputRegisters.bind(modbus), 'input', req, res)
  );
};

var _request = function (fun, kind, req, res) {
  try {
    fun(parseInt(req.params.unit), parseInt(req.params.address),
      parseInt(req.params.quantity), _getParseOptions(kind, req))
      .then((data) => res.send(data))
      .catch(function (error) {
        console.log('Error', error.stack);
        res.status(500).send(error.toString !== undefined ? error.toString() : error);
      });
  } catch (error) {
    console.log('Error', error.stack);
    res.status(error.httpstatus || 500).send(error.toString !== undefined ? error.toString() : error);
  }
}

var _getParseOptions = function (kind, req) {
  var interpretersLiterals = req.query.interpreters !== undefined ? req.query.interpreters.split(',') : ['default'];
  return {
    kind: kind,
    quantity: parseInt(req.params.quantity),
    length: parseInt(req.query.length) || 1,
    interpreters: interpretersLiterals.map(function (s) {
      var f = interpreters[s];
      if (f === undefined) {
        throw new ModbusError(400, 'No interpreter named "' + s + '" found.');
      }

      return f;
    }),
  };
};

var _partial = function (fn, value) {
  // A reference to the Array#slice method.
  var slice = Array.prototype.slice;
  // Convert arguments object to an array, removing the first argument.
  var args = slice.call(arguments, 1);

  return function () {
    // Invoke the originally-specified function, passing in all originally-
    // specified arguments, followed by any just-specified arguments.
    return fn.apply(this, args.concat(slice.call(arguments, 0)));
  };
};

module.exports.setup = setup;
