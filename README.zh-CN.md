# MQTT

```bash
cle plugins i /path/to/cle-plugin-mqtt-x.x.x.cp
```
参考代码仓库：[https://github.com/coreaiot/rtls-cle-examples.git](https://github.com/coreaiot/rtls-cle-examples.git)

## nodejs 代码示例
```js
import { connect } from 'mqtt';
import { unzip } from 'zlib';

const topic = '/cle/mqtt';
const c = connect('mqtt://localhost');

console.log('Connecting ...');

c.on('connect', () => {
  console.log('Connected.')
  c.subscribe(topic);
});

c.on('message', (t, msg) => {
  if (t === topic) {
    unzip(msg, (err, buffer) => {
      if (err) return;
      const json = buffer.toString();
      console.log(json);
    });
  }
});
```

## Java 代码示例
```java
package com.coreaiot.cle.examples;

import java.io.*;
import java.util.zip.*;

import org.eclipse.paho.mqttv5.client.*;
import org.eclipse.paho.mqttv5.common.*;
import org.eclipse.paho.mqttv5.common.packet.*;
import org.eclipse.paho.mqttv5.client.persist.*;

public class App {

  public static void main(String[] args) {
    String serverURI = "tcp://localhost:1883";
    String clientId = "";
    String topicFilter = "/cle/mqtt";
    int qos = 0;
    try {
      MqttConnectionOptions connOpts = new MqttConnectionOptions();
      connOpts.setCleanStart(false);

      MqttClient mqttClient = new MqttClient(
          serverURI,
          clientId,
          new MemoryPersistence());

      mqttClient.setCallback(new MqttCallback() {
        @Override
        public void disconnected(MqttDisconnectResponse disconnectResponse) {
        }

        @Override
        public void mqttErrorOccurred(MqttException exception) {
        }

        @Override
        public void messageArrived(String topic, MqttMessage message) throws Exception {
          System.out.println(new String(unzip(message.getPayload())));
        }

        @Override
        public void deliveryComplete(IMqttToken token) {
        }

        @Override
        public void connectComplete(boolean reconnect, String serverURI) {
          System.out.println("Connected");
        }

        @Override
        public void authPacketArrived(int reasonCode, MqttProperties properties) {
        }

      });

      mqttClient.connect(connOpts);
      mqttClient.subscribe(topicFilter, qos);
    } catch (MqttException me) {
      me.printStackTrace();
    }
  }

  public static byte[] unzip(byte[] data) throws IOException, DataFormatException {
    Inflater inf = new Inflater();
    inf.setInput(data);
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    byte[] buffer = new byte[1024];
    while (!inf.finished()) {
      int count = inf.inflate(buffer);
      baos.write(buffer, 0, count);
    }
    baos.close();
    return baos.toByteArray();
  }
}

```

## .NET 代码示例

```csharp
using MQTTnet;
using MQTTnet.Client;
using ICSharpCode.SharpZipLib.Core;
using ICSharpCode.SharpZipLib.Zip.Compression.Streams;
using System.Text;

var mqttFactory = new MqttFactory();

using (var mqttClient = mqttFactory.CreateMqttClient())
{
    var mqttClientOptions = new MqttClientOptionsBuilder().WithTcpServer("localhost").Build();
    var topicFilter = new MqttTopicFilterBuilder().WithTopic("/cle/mqtt").Build();

    mqttClient.ConnectedAsync += e =>
    {
        Console.WriteLine("Connected.");
        return Task.CompletedTask;
    };

    mqttClient.ApplicationMessageReceivedAsync += e =>
    {
        var receiveBytes = e.ApplicationMessage.Payload;
        var output = new MemoryStream();
        try
        {
            var dataBuffer = new byte[4096];
            using (var compressedStream = new MemoryStream(receiveBytes))
            using (var stream = new InflaterInputStream(compressedStream))
                StreamUtils.Copy(stream, output, dataBuffer);
            var json = Encoding.UTF8.GetString(output.ToArray());
            Console.WriteLine(json);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.ToString());
        }
        return Task.CompletedTask;
    };

    await mqttClient.ConnectAsync(mqttClientOptions, CancellationToken.None);
    await mqttClient.SubscribeAsync(topicFilter, CancellationToken.None);

    while (true)
        Console.ReadLine();
}
```

# 编译此插件

```bash
npm run build && npm run pack
```
