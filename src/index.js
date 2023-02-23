const config = require('./config');
const i18n = require('./i18n');
require('./type');

const { connect } = require('mqtt');
const { deflate } = require('zlib');

function createMqttClient(config) {
  /**
   * @type {import('mqtt').IClientOptions}
   */
  const opt = {
    port: config.port,
    protocolVersion: config.protocolVersion,
    reconnectPeriod: 1000,
  };
  if (config.protocolVersion === 3) {
    opt.protocolId = 'MQIsdp';
  }
  if (config.username) {
    opt.username = config.username;
    opt.password = config.password;
  }

  const client = connect(
    config.url,
    opt
  );

  return client;
}

/**
 * @param {IPlugin} self 
 * @param {Object} env 
 * @param {IUtils} utils 
 * @param {IGateways} gateways 
 * @param {IBeacons} beacons 
 * @returns {Promise<boolean>}
 */
async function init(self, env, utils, gateways, beacons) {
  const config = await utils.loadConfig(self);
  const client = createMqttClient(config);
  let connected = false;
  client.on('connect', () => {
    self.logger.info('MQTT connected.');
    connected = true;
  });
  client.on('disconnect', () => {
    self.logger.warn('MQTT disconnected.');
    connected = false;
  });
  client.on('error', err => {
    self.logger.error(err);
  });

  setInterval(() => {
    if (!connected) return;

    const now = new Date().getTime();

    const data = {};
    for (const [k, v] of Object.entries(beacons)) {
      const exp = config.postOutdatedTags ? v.updatedAt + env.beaconLifetime : v.updatedAt + env.beaconAuditTime;
      if (v.x !== undefined && exp > now)
        data[k] = v;
    }
    if (Object.keys(data).length) {
      const json = JSON.stringify({
        type: 'sensors',
        data,
      });
      if (config.compress) {
        deflate(Buffer.from(json), (err, out) => {
          if (err) {
            if (self.debug)
              self.logger.error(err);
          } else {
            client.publish(config.topic, out);
          }
        });
      } else {
        client.publish(config.topic, json);
      }
    }
  }, env.beaconAuditTime);

  setInterval(() => {
    if (!connected) return;

    const data = {};
    const now = new Date().getTime();
    for (const [k, v] of Object.entries(gateways)) {
      data[k] = {
        ...v,
        online: v.updatedAt + env.gatewayLifeTime >= now,
      };
    }

    const json = JSON.stringify({
      type: 'locators',
      data,
    });
    if (config.compress) {
      deflate(Buffer.from(json), (err, out) => {
        if (err) {
          if (self.debug)
            self.logger.error(err);
        } else {
          client.publish(config.topic, out);
        }
      });
    } else {
      client.publish(config.topic, json);
    }
  }, env.gatewayAuditTime);
  return true;
}

/**
 * @param {IPlugin} self
 * @param {IUtils} utils
 */
async function test(self, utils) {
  self.logger.info('Test', self.name);
  self.logger.info('Loading Config ..');
  const config = await utils.loadConfig(self);
  console.log(config);

  const client = createMqttClient(config);
  client.on('connect', () => {
    self.logger.info('MQTT connected.');
    client.subscribe(config.topic, err => {
      if (err) {
        self.logger.error(err);
        process.exit(1);
      }
      client.publish(config.topic, 'test');
    });
  });
  client.on('error', err => {
    self.logger.error(err);
    process.exit(1);
  });
  client.on('message', function (topic, message) {
    if (topic === config.topic && message.toString() === 'test') {
      client.end(() => {
        self.logger.info('Test OK.');
      });
    }
  });
}

module.exports = { init, test, config, i18n };
