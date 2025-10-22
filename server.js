// server.js
const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;       // webhook verify token
const PAGE_TOKEN = process.env.PAGE_ACCESS_TOKEN;    // Page or Workplace access token
const API_VERSION = process.env.GRAPH_API_VERSION || 'v17.0'; // use the version you need

// webhook verification (GET)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// webhook receiver (POST)
app.post('/webhook', async (req, res) => {
  // handle messages/events
  console.log('Webhook event:', JSON.stringify(req.body).slice(0,1000));
  // implement event handling here
  res.sendStatus(200);
});

// send a message to a thread / conversation
async function sendMessageToThread(threadId, text) {
  const url = `https://graph.facebook.com/${API_VERSION}/${threadId}/messages`;
  const body = {
    message: { text }
  };
  const resp = await fetch(url + `?access_token=${PAGE_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return resp.json();
}

// Example: rename a thread (Workplace supports renaming via Graph API in bots that have perms)
// NOTE: replace endpoint and params per Workplace docs
async function renameThread(threadId, newName) {
  const url = `https://graph.facebook.com/${API_VERSION}/${threadId}`;
  const body = { name: newName };
  const resp = await fetch(url + `?access_token=${PAGE_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return resp.json();
}

// placeholder for create group (Workplace: create thread with recipients) 
// Check the Workplace docs for exact path/params & required permissions before using.
async function createGroup(recipientsArray /* e.g. ['user1', 'user2'] */, name) {
  const url = `https://graph.facebook.com/${API_VERSION}/threads`; // placeholder — check docs
  const body = { recipients: recipientsArray, name };
  const resp = await fetch(url + `?access_token=${PAGE_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return resp.json();
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
