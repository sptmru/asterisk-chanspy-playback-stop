import express, { Request, Response } from 'express';
import { Channel, connect } from 'ari-client';
import * as bodyParser from 'body-parser';
import { Client } from 'ari-client';
import cors from 'cors';

const app = express();
const port = 3000;

// Replace with your actual Asterisk ARI details
const ARI_URL = 'http://username:password@asterisk.orb.local:8088';
const ARI_USER = 'username';
const ARI_PASS = 'password';

// Connect to ARI
let ari: Client;
connect(ARI_URL, ARI_USER, ARI_PASS)
  .then((client: Client) => {
    ari = client;
  })
  .catch((error: Error) => {
    console.error('Error connecting to ARI:', error);
  });

app.use(cors<Request>());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get('/channels', (_req: Request, res: Response) => {
  ari.channels
    .list()
    .then((channels: Channel[]) => {
      res.send(channels.map(channel => channel.name));
    })
    .catch(error => {
      console.error('Error retrieving channels:', error);
      res.status(500).send('Error retrieving channels');
    });

  return;
});

app.post('/mute', (req: Request, res: Response) => {
  const { channelName } = req.body;

  ari.channels
    .originate({ endpoint: 'Local/s', extension: 's', context: 'mute', variables: { CHAN: channelName } })
    .then(() => {
      res.json({ status: 'Channel was muted' });
    })
    .catch(error => {
      console.error('Error sending mute command:', error);
      res.status(500).send('Error sending mute command');
    });

  return;
});

app.post('/unmute', (req: Request, res: Response) => {
  const { channelName } = req.body;

  ari.channels
    .originate({ endpoint: 'Local/s', extension: 's', context: 'unmute', variables: { CHAN: channelName } })
    .then(() => {
      res.json({ status: 'Channel was unmuted' });
    })
    .catch(error => {
      console.error('Error sending unmute command:', error);
      res.status(500).send('Error sending unmute command');
    });

  return;
});

app.post('/play', (req: Request, res: Response) => {
  const { channelName } = req.body;

  ari.channels
    .originate({ endpoint: 'Local/s@spy', extension: 's', context: 'playback', variables: { CHAN: channelName } })
    .then(() => {
      res.json({ status: 'Playing message to the channel' });
    })
    .catch(error => {
      console.error('Tried to play a message, but got error:', error);
      res.status(500).send('Error sending play command');
    });

  return;
});

app.post('/stop-play', (req: Request, res: Response) => {
  const { channelName } = req.body;

  ari.channels
    .originate({ endpoint: 'Local/s', extension: 's', context: 'pause', variables: { CHAN: channelName } })
    .then(() => {
      res.json({ status: 'Stop playing message to the channel' });
    })
    .catch(error => {
      console.error('Tried to stop a message, but got error:', error);
      res.status(500).send('Error sending stop command');
    });

  return;
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
