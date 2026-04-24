const express = require('express');
const cors = require('cors');
const bfhlRoutes = require('./routes/bfhlRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', bfhlRoutes);

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