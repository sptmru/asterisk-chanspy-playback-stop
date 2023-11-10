import express, { Request, Response } from 'express';
import * as bodyParser from 'body-parser';
import cors from 'cors';

// @ts-expect-error: no types available for package
import AMI from 'asterisk-manager';

const app = express();
const port = 3000;

const AMI_HOST = 'asterisk.orb.local';
const AMI_PORT = 5038;
const AMI_USERNAME = 'admin';
const AMI_PASSWORD = '12345';

const asterisk = new AMI(AMI_PORT, AMI_HOST, AMI_USERNAME, AMI_PASSWORD, true);
asterisk.keepConnected();

// Connect to ARI
// let ari: Client;
// connect(ARI_URL, ARI_USER, ARI_PASS)
//   .then((client: Client) => {
//     ari = client;
//   })
//   .catch((error: Error) => {
//     console.error('Error connecting to ARI:', error);
//   });

app.use(cors<Request>());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get('/channels', (_req: Request, res: Response) => {
  asterisk.action({
    action: 'CoreShowChannels'
  }, (err: never, result: never) => {
    if (err) {
      console.error(err);
    }
    console.log(result);
  });

  asterisk.on('response', (evt: never) => {
    console.log(evt);
    res.send(evt);
  });
});

app.post('/mute', (req: Request, res: Response) => {
  const { channelName } = req.body;

  asterisk.action({
    'action': 'Originate',
    'channel': 'Local/s',
    'context': 'mute',
    'exten': 's',
    'priority': 1,
    'variable': {
      'CHAN': channelName
    }
  });

  res.json({ status: 'Channel was muted' });
});

app.post('/unmute', (req: Request, res: Response) => {
  const { channelName } = req.body;

  asterisk.action({
    'action': 'Originate',
    'channel': 'Local/s',
    'context': 'unmute',
    'exten': 's',
    'priority': 1,
    'variable': {
      'CHAN': channelName
    }
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
