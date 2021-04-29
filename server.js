require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongo = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {nanoid} = require('nanoid');
const dns = require('dns');

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
const urlItem = mongoose.model("URL", urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', async function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Create New URL
app.post('/api/shorturl', async (req, res) =>{
  let url = req.body.url;
  let urlObject = new URL(url)
  let urlCode = nanoid();
  let valid = true;

  // Check for valid protocol
  if (urlObject.protocol != 'https:' && urlObject.protocol != 'http:'){
    valid = false;
  } else {
    // Check for valid hostname
    dns.lookup(urlObject.hostname, (err) => {
      if (err) {
        valid = false;
      }
    });
  }

  // Check if URL is stored
  if (valid) {
    try{
      let findOne = await urlItem.findOne({
        original_url: url
      })
      // If saved, return URL
      if (findOne){
        console.log("Retrieving Stored URL")
        res.json({
          original_url: findOne.url,
          short_url: findOne.urlCode
        })
      }
      // If new, save URL 
      else {
        console.log("New URL - Saving.")
        findOne = new urlItem({
          original_url: url,
          short_url: urlCode
        })
        res.json({
          original_url: url,
          short_url: urlCode
        })
        await findOne.save()
        console.log("URL Saved")
      }

    } catch (err) {
      console.error(err);
    }
  } else {
    console.error("Invalid URL");
    res.json({error: 'invalid url'});
  }

});

// Get original url
app.get('/api/shorturl/:short_url', async (req, res) => {
  try{
    let findOne = await urlItem.findOne({
      short_url: req.params.short_url
    })
    if (findOne) {
      console.log("URL Found");
      return res.redirect(findOne.original_url);
    } else {
      console.log("No URL Found");
      return res.json("No URL Found")
    }
  } catch (err) {
    console.error(err);
    res.json("Database Error")
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
