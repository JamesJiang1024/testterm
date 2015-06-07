suite('trying client', () => {
  var debug = require('debug')('docker-exec-websocket-server:test:client');
  var through = require('through');
  var msgcode = require('../lib/messagecodes.js');
  var DockerClient = require('../lib/client.js');
  var DockerServer = require('../lib/server.js');
  var base = require('taskcluster-base');
  var assert = require('assert');

  var server = new DockerServer({
    port: 8081,
    containerId: 'servertest',
    path: '/a'
  });

  test('cat', async () => {
    let client = await DockerClient({
      hostname: 'localhost',
      port: 8081,
      pathname: 'a',
      tty: 'false',
      command: ['cat','-E'],
    });
    debug(client);
    var buf1 = new Buffer([0xfa, 0xff, 0x0a]);
    buf1[0] = 0xfa;
    buf1[1] = 0xff;
    buf1[2] = 0x0a;
    client.stdin.write(buf1);
    var passed = false;
    client.stdout.on('data', (message) => {
      var buf = new Buffer([0xfa, 0xff, 0x24, 0x0a]); //looks something like 0xfa 0xff $(-E option) 0x0a
      debug(message)
      assert(buf.compare(message) === 0, 'message wrong!');
      passed = true;
    });
    await base.testing.poll(async () => {
      assert(passed,'message not recieved')
    }, 20, 250).then(() => {
      debug('successful');
    }, err => {throw err; });
  });
});