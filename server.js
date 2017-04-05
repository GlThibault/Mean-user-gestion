require('rootpath')();
const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const expressJwt = require('express-jwt');
const config = require('./server/config.json');

// Get our API routes
const api = require('./server/routes/api');
const controller = require('./server/controllers/users.controller');

// Test MongoDB Connection
var MongoClient = require('mongodb').MongoClient,
  assert = require('assert');
var url = 'mongodb://localhost/hypertube';
MongoClient.connect(url, function (err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to MongoDB server");
  db.close();
});

// Parsers for POST data
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, './server/public')));

// app.use(expressJwt({
//   secret: config.secret
// }).unless({
//   path: ['/users/authenticate', '/users/register']
// }));

// routes
app.use('/users', controller);

// Set our api routes
app.use('/api', api);

// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || '3000';
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => console.log(`Server running on localhost:${port}`));
