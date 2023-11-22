import express, { Request, Response } from 'express';
import * as bodyParser from 'body-parser';
import cors from 'cors';

import AMI from 'asterisk-manager';

const app = express();
const port = 3000;

const AMI_HOST = '151.80.247.240';
const AMI_PORT = 5038;
const AMI_USERNAME = 'admin';
const AMI_PASSWORD = 'sgypppvf';

const asterisk = new AMI(AMI_PORT, AMI_HOST, AMI_USERNAME, AMI_PASSWORD, true);
asterisk.keepConnected();

app.use(cors<Request>());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

function getActiveChannels(ami) {
  return new Promise((resolve, reject) => {
    const channelsInfo: never[] = [];
    ami.action({
      action: 'CoreShowChannels'
    }, (err: never) => {
      if (err) {
        reject(err);
      }
    });

    setTimeout(() => {
      resolve(channelsInfo);
    }, 500);

    ami.on('coreshowchannel', function(evt: { channel: never; calleridnum: never; }) {
      console.log('CoreShowChannel event received');
      console.log(evt);
      // Assuming you're interested in the Channel and CallerIDNum attributes.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      channelsInfo.push({channel: evt.channel, callerID: evt.calleridnum});
    });
  });
}

app.get('/channels', async (_req: Request, res: Response) => {
  try {
    const channels = await getActiveChannels(asterisk);
    res.send({ channels: channels });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'There was an error connecting to the Asterisk server' });
  }
});

app.post('/mute', (req: Request, res: Response) => {
  const { channelName } = req.body;

  asterisk.action({
    'action': 'MuteAudio',
    'channel': channelName,
    'direction': 'out',
    'state': 'on',
    'ActionID': 2,
  });

  res.json({ status: 'Channel was muted' });
});

app.post('/unmute', (req: Request, res: Response) => {
  const { channelName } = req.body;

  asterisk.action({
    'action': 'MuteAudio',
    'channel': channelName,
    'direction': 'out',
    'state': 'off',
    'ActionID': 2,
  });

  res.json({ status: 'Channel was unmuted' });
});

app.post('/play', (req: Request, res: Response) => {
  const { channelName } = req.body;

  asterisk.action({
    'action': 'Originate',
    'channel': 'Local/s@spy',
    'context': 'playback',
    'exten': 's',
    'priority': 1,
    'variable': {
      'CHAN': channelName
    }
  });

  res.json({ status: 'Playing message to channel' });
});

app.post('/play/:soundName', (req: Request, res: Response) => {
  const { channelName } = req.body;

  asterisk.action({
    'action': 'Originate',
    'channel': 'Local/s@spy',
    'context': 'playback',
    'exten': 's',
    'priority': 1,
    'variable': {
      'CHAN': channelName,
      'SOUNDNAME': req.params.soundName,
    }
  });

  res.json({ status: 'Playing message to channel' });
});

app.post('/stop-play', (req: Request, res: Response) => {
  const { channelName } = req.body;

  asterisk.action({
    'action': 'Originate',
    'channel': 'Local/s',
    'context': 'pause',
    'exten': 's',
    'priority': 1,
    'variable': {
      'CHAN': channelName
    }
  });

  res.json({ status: 'Stopped message to channel' });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
