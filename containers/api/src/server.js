// import .env environment variables
require('dotenv').config();

// postgres
const {Pool} = require('pg');
const pool = new Pool();

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const fs = require('fs');

// express api
const express = require('express');
const app = express();
const port = 60777;
const https = require('https');
const cors = require('cors');
// expect incomming body to be in JSON format
app.use(express.json());

// globals
let gpu_list;


// ____________________________________________________________________________

loop();


// ____________________________________________________________________________

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loop() {
  while (true) {
    try {
      gpu_list = await getGPUList();  // update gpulist

    } catch (err) {
      console.error(err);
    }
    await sleep(10 * 1000);
  }
}

async function getGPUList() {
  // get all gpulist
  // Accessing database
  const client = await pool.connect();
  var gpulist = await (client.query('SELECT * FROM gpulist'));
  client.release();
  // Got data
  if (gpulist.rows.length === 0) {
    throw (new Error('Failed to get any GPUs'));
  }
  var res = [];
  for (var i = 0; i < gpulist.rows.length; ++i) {
    res.push(gpulist.rows[i]);
  }
  // Got gpu list!
  return res;
}

async function getListings() {}

/*
let min_gpu = {
  title: i.title,
  gpu: gpu.name,
  brand: gpu.brand,
  price: -1,
  perf: gpu.relative,
  ppp: -1,
  itemurl: i.viewItemURL,
  imageurl: i.galleryURL
};*/

app.post('/get_listings', cors(), async (req, res) => {
  // create a new entry here
  console.log(req.body);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader(
      'Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin');
  // check that request has required data
  if (req.body.filters && req.body.count && req.body.first != null) {
    let filters = req.body.filters;
    let count = req.body.count;
    let first = req.body.first;

    let match_count = 0;
    let current = 0;
    let matches = [];

    let conditions = [];
    for (let property in filters) {
      switch (property) {
        case 'specific':
          if (gpu.gpu != value) {
            match = false;
          }
          break;
        case 'minperf':
          if (gpu.perf < value) {
            match = false;
          }
          break;
        case 'brand':
          conditions.push(
              '(SELECT brand FROM gpulist WHERE name =' + value + ')');
          if (gpu.brand != value) {
            match = false;
          }
          break;
        case 'min':
          if (gpu.price < value) {
            match = false;
          }
          break;
        case 'max':
          if (gpu.price > value) {
            match = false;
          }
          break;
      }
    }

    // await pool.query('SELECT * FROM gpudb WHERE _ ORDER BY (price / (SELECT
    // relative FROM gpulist WHERE name = gpu)');

    /*
while (match_count < count && current < listing_number) {
  let sorted_gpus = [];
  let gpu = sorted_gpus[current];
  let match = true;
  for (let property in filters) {
    let value = filters[property];
    // only continue if filter exists and can still possibly be a match
    if (value != '' && match == true) {
      switch (property) {
        case 'specific':
          if (gpu.gpu != value) {
            match = false;
          }
          break;
        case 'minperf':
          if (gpu.perf < value) {
            match = false;
          }
          break;
        case 'brand':
          if (gpu.brand != value) {
            match = false;
          }
          break;
        case 'min':
          if (gpu.price < value) {
            match = false;
          }
          break;
        case 'max':
          if (gpu.price > value) {
            match = false;
          }
          break;
      }
    }
  }
  if (match && current >= first) {
    ++match_count;
    matches.push(gpu);
  }
  ++current;
}*/

    let to_be_sent = {};
    to_be_sent.matches = await pool.query(
        'SELECT * FROM gpudb ORDER BY (price / (SELECT relative FROM gpulist WHERE name = gpu) LIMIT ' +
        count + ' OFFSET ' + first);
    res.send(to_be_sent);
  } else {
    res.send(
        'ERROR: Incorrect number of incomming JSON objects. Expected filters object, count int and first int');
  }
});

app.get('/get_gpus', cors(), async (req, res) => {
  console.log(gpu_list);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader(
      'Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin');
  return res.send(gpu_list);
});

app.options('/get_listings', cors())  // include before other routes
app.options('/get_gpus', cors())      // include before other routes

https
    .createServer(
        {
          key: fs.readFileSync('./certs/privkey.pem'),
          cert: fs.readFileSync('./certs/fullchain.pem')
        },
        app)
    .listen(port, () => {
      console.log('Live on port ' + port);
    });
