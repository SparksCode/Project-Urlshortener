require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongo = require('mongodb');
const mongoose = require('mongoose');

// Connect to Mongo DB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Check Connection
const connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

// Create URL Schema
const Schema = mongoose.Schema;
const urlSchema = new Schema({
  original_url: String,
  short_url: String
})
const URL = mongoose.model("URL", urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Create New URL

// Get original url

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
