#!/usr/bin/env node

const program = require('commander');

const server = require('../lib/server');
const version = require('../package.json').version;
const numberRegex = /^[0-9]*$/;
// get user cli arguments
program
    .version(version)
    .option('-p, --port <number>', 'Port which REST interface will listen to. [20900]', numberRegex, 20900)
    .option('-s, --serial <port>', 'Serial port, e.g. /dev/ttyUSB0', false)
    .option('-b, --baudrate <baud>', 'Set baudrate when using serial interface. [9600]', numberRegex, 9600)
    .option('-c, --parity <parity>', 'Parity for serial communication. none/odd/even [none]', /^(none|even|odd)$/i, 'none')
    .option('-H, --host <host>', 'Set host of TCP slave.', false)
    .option('-P, --slaveport <number>', 'Set port of TCP slave. [502]', numberRegex, 502)
    .on('--help', function(){
        console.log('  Examples:');
        console.log('');
        console.log('    modbus-rest --serial /dev/ttyUSB0');
        console.log('       create a bridge to a modbus slave using serial interface.');
        console.log('    modbus-rest --host localhost');
        console.log('       create a bridge to a TCP modbus slave.');
        console.log('');
    })
    .parse(process.argv);

// start the server
server.start(program);
