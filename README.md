RESTful(ish) API to Modbus
=======

### Overview

Modbus is a serial communication protocol used to exchange information between electronic devices. Typically, only the modbus master
in a modbus network is the one initiating communication and slaves respond to these requests. In this case, the modbus-rest acts as
the master and communication (writing and reading registers) is initated through the REST API.

### API
Common path parameters in the API are: `unit` - the slave id, `address` - the starting address of a read or write, `quantity` - the number of registers/coils to read or write.

| URL | Method | Description |
|-----|--------|-------------|
| /{unit}/coil/{address} | GET | Reads the state of a coil. |
| /{unit}/coil/{address}/{quantity} | GET | Reads the states of multiple coils. |
| /{unit}/coil/{address} | POST | Writes a coil state. POST body should contain `true` or `false`|
| /{unit}/coil/{address}/{quantity} | POST | Writes multiple coil states. POST body should contain a JSON array of `true`/`false`|
| /{unit}/discrete/{address} | GET | Reads the state of a discrete input. |
| /{unit}/discrete/{address}/{quantity} | GET | Reads the states of multiple discrete inputs. |
| /{unit}/holding/{address} | GET | Reads the value of a holding register. |
| /{unit}/holding/{address}/{quantity} | GET | Reads the values of multiple holding registers. |
| /{unit}/holding/{address} | POST | Writes a value to a holding register. POST body should contain the value to write.|
| /{unit}/holding/{address}/{quantity} | POST | Writes values to multiple holding registers. POST body should contain the raw buffer (2 bytes per register) to write, base64 encoded. |
| /{unit}/input/{address} | GET | Reads the value of an input register. |
| /{unit}/input/{address}/{quantity} | GET | Reads the values of multiple input registers. |

#### Query parameters
There are also a number of query parameters available:

`length` defines the raw register length of a value. This can be useful when a device uses more than one register to store a value.

`interpreters` defines transformation methods to use when reading registers, see below. Multiple interpreters can be chained by comma separation.

#### Interpreters
The following interpreters are supported:

`raw` - Do not default to any interpreter, always return raw response

`integer` (default for registers) - Returns an integer representation of the register value

`tenths` - Divide value by 10.

`float32` - Interpret the input as a floating value according to IEEE-754.

`float32le` - Interpret the input as floating value according to IEEE-754 with little endian.
