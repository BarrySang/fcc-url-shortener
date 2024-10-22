require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();

const urls = []; // Temporary in-memory storage for URLs (you can switch to a database)

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));

// Basic Configuration
const port = process.env.PORT || 3000;

// Serve the frontend page
app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// First API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// POST URL to shorten it
app.post('/api/shorturl', function (req, res) {
  const url = req.body.url;
  let urlObj;

  // Check if the URL includes a valid protocol
  try {
    urlObj = new URL(url);
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  // Extract hostname for DNS lookup
  const hostname = urlObj.hostname;

  dns.lookup(hostname, (err, address) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    } else {
      // Store the URL with an ID
      const shortUrl = urls.length + 1;
      urls.push({ original_url: url, short_url: shortUrl });
      res.json({ original_url: url, short_url: shortUrl });
    }
  });
});

// GET request for shortened URL
app.get('/api/shorturl/:id', (req, res) => {
  const shortUrlId = parseInt(req.params.id);
  const urlEntry = urls.find((entry) => entry.short_url === shortUrlId);

  if (urlEntry) {
    res.redirect(urlEntry.original_url);
  } else {
    res.json({ error: 'No short URL found' });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
