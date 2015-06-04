suite('trying server', () => {
  test('cat', () => {
    var debug = require('debug')('docker-exec-websocket-server:test');
    var ws = require('ws');
    var Server = require('../lib/server.js');
    var slugid = require('slugid');
    var path = require('path');
    var assert = require('assert');

    var randpath = '/'+slugid.v4();

    var server = new Server({
      container: 'servertest',
      port: 8080,
      path: randpath,
    });
    assert(server,'server required!');

    var socket = new ws('ws://localhost:8080'+randpath);
    assert(socket,'socket connection required!');

    socket.once('message',(message) => {
      debug(message);
      var buf1 = new Buffer(3);
      buf1[0] = 0xfa;
      buf1[1] = 0xff;
      buf1[2] = 0x0a;
      socket.send(buf1, {binary: true, mask: true});
      socket.on('message', (message) => {
        var buf = new Buffer(4);
        buf[0] = 0x01;
        buf[1] = 0xfa;
        buf[2] = 0xff;
        buf[3] = 0x0a;
        assert(buf.compare(message) === 0);
      })
    });
    socket.on('open',() => {
      socket.send('cat');
    });
  });
});