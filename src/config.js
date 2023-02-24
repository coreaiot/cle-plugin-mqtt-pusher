module.exports = {
  description: 'MQTT Plugin configurations.',
  fields: [
    {
      name: 'url',
      type: 'text',
      description: 'URL',
      placeholder: 'e.g. mqtt://example.com',
      value: 'mqtt://localhost',
    },
    {
      name: 'port',
      type: 'number',
      description: 'Port',
      placeholder: 'e.g. 1883',
      value: 1883,
    },
    {
      name: 'topic',
      type: 'text',
      description: 'Topic',
      placeholder: 'e.g. /cle/mqtt',
      value: '/cle/mqtt',
    },
    {
      name: 'username',
      type: 'text',
      description: 'Username',
      placeholder: 'e.g. john001',
      value: '',
    },
    {
      name: 'password',
      type: 'password',
      description: 'Password',
      value: '',
    },
    {
      name: 'compress',
      type: 'switch',
      description: 'Compress data using deflate',
      value: true,
    },
    {
      name: 'postOutdatedTags',
      type: 'switch',
      description: 'Post outdated tags',
      value: false,
    },
    {
      name: 'protocolVersion',
      type: 'dropdown',
      description: 'MQTT Protocol Version',
      items: [
        {
          label: '3.1',
          value: 3,
        },
        {
          label: '3.1.1',
          value: 4,
        },
        {
          label: '5.0',
          value: 5,
        },
      ],
      value: 4,
    },
  ],
};