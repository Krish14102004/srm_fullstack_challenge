const express = require('express');
const cors = require('cors');
const bfhlRoutes = require('./routes/bfhlRoutes');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', bfhlRoutes);

// Simple root route to avoid "Cannot GET /" in browser
app.get('/', (req, res) => {
  res.status(200).send('BFHL backend is running. POST to /bfhl with { data: ["A->B"] }');
});

// Respond to favicon requests with no content to avoid 404 noise
app.get('/favicon.png', (req, res) => {
  res.status(204).end();
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: true,
      message: 'Invalid JSON body',
    });
  }
  next(err);
});

module.exports = app;