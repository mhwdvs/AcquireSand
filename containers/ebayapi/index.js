// postgres
const {Pool} = require('pg');
const pool = new Pool();

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

loop();

// database update loop
async function loop(){
  while(true){
    await main();
    console.log("Looping!");
  }
}

async function main() {
  gpuList = [];
  // get all gpulist
  console.log('Getting GPU list from database');
  try {
    gpuList = await getGPUList();
    console.log("final initial gpulist: " + gpuList);
  } catch (e) {
    console.error('Error in getting GPU list from database' + e.name + e.message);
    return;
  }

  console.log('Setting existing listings as \"Unavailable\"');
  try {
    await setExistingUnavailable();
  } catch (e) {
    console.log('Error in setting existing listings as "Unavailable"' + e.name + e.message);
    return;
  }

  console.log('Getting new ebay listings and updating database');
  try {
    await getListings(gpuList);
  } catch (e) {
    console.log('Error in getting new ebay listings and updating database' + e.name + e.message);
    return;
  }

  console.log('Removing \"Unavailable\" listings');
  try {
    await purgeUnavailable();
  } catch (e) {
    console.log('Error in removing "Unavailable" listings' + e.name + e.message);
    return;
  }
}

async function getGPUList() {
  // get all gpulist
  try{
    console.log("Accessing database")
    var gpulist = await(pool.query('SELECT * FROM gpulist'));
    console.log("Got data")
    if(gpulist.rows.length === 0){
      console.error("Failed to get any GPUs");
      throw(new Error("Failed to get any GPUs"));
    }
    var res = [];
    for(var i = 0; i < gpulist.rows.length; ++i){
      //replace spaces with + to be suitable for url request format
      res.push(gpulist.rows[i].name.split(' ').join('+'));
    }
    console.log("Got gpu list!");
    return res
  }
  catch(err){
    console.error('Error getting GPU List: ' + err.name + err.message);
    throw err;
  }
}

async function setExistingUnavailable() {
  // mark all existing listings as "unavailable"
  // clients will also use environment variables
  // for connection information
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack);
    }
    client.query('UPDATE gpudb SET available = FALSE', (err, res) => {
      release();
      if (err) return console.error('Error executing query', err.stack);
    }); // has result if neccessary
  });
}

async function getListings(gpuList) {
  // search for each gpu
  // TODO create async tasks, start all together and wait for completion
  promises = [];
  for (const gpu of gpuList) {
    promises.push(getGPU(gpu));
  }

  // wait for all promises to resolve
  (async () => {
    await Promise.all(promises);
    return;
  })();
}

async function getGPU(gpu) {
  // localisation tbd
  const COUNTRY = 'AU';
  const CURRENCY = 'AUD';

  // make request to ebay api
  // Create WebSocket connection.
  const url = ['https://svcs.ebay.com/services/search/FindingService/v1?',
    'OPERATION-NAME=findItemsAdvanced&',
    'SERVICE-VERSION=1.13.0&',
    'SECURITY-APPNAME=',
    process.env('EBAY_API_KEY'),
    '&',
    'RESPONSE-DATA-FORMAT=JSON&',
    'REST-PAYLOAD=true&',
    'GLOBAL-ID=EBAY-' + COUNTRY + '&',
    'affiliate.networkId=9&', // SHOULD BE VARIABLE
    'affiliate.trackingId=5338664158&', // SHOULD BE VARIABLE
    // ITEM FILTERS
    // additional item filters can be found at
    // https://developer.ebay.com/devzone/finding/callref/types/ItemFilterType.html
    'itemFilter(0).name=Condition&',
    'itemFilter(0).value(0)=3000&', // Used
    'itemFilter(0).value(1)=1000&', // New
    'itemFilter(0).value(2)=1500&', // New (other, see item details
    'itemFilter(0).value(3)=2000&', // Manufacturer refurbished
    'itemFilter(0).value(4)=4000&', // Very good
    'itemFilter(0).value(5)=5000&', // Good
    'itemFilter(0).value(6)=6000&', // Acceptable
    'itemFilter(1).name=ListingType&',
    'itemFilter(1).value(0)=FixedPrice&',
    'itemFilter(1).value(1)=AuctionWithBIN&',
    'itemFilter(1).value(2)=StoreInventory&',
    'itemFilter(2).name=LocalPickupOnly&',
    'itemFilter(2).value=false&',
    'itemFilter(3).name=Currency&',
    'itemFilter(3).value=' + CURRENCY + '&', // LOCALISATION TARGET
    'itemFilter(4).name=LocatedIn&',
    'itemFilter(4).value=' + COUNTRY + '&', // LOCALISATION TARGET
    'keywords=',
    gpu, // The gpu  being searched for
    '+-cooler+-performance+-like+-backplate+-waterblock+-buying+-bracket+-fan+-fans+-replacement+-mosfet+-powerlink+-bios+-nvlink+-kit+-suits+-faulty+-1080p+-description&', // Blacklisted terms
    'LH_PrefLoc=1&', // Only show items within region selected
    'categoryId=27386&',
    'paginationInput.entriesPerPage=100&', // redundent?
    'sortOrder=PricePlusShippingLowest'].join();

  const socket = new WebSocket(url);
  // Listen for messages asynchronously
  socket.addEventListener('message', function(event) {
    // interpret returned JSON
    // const req = event.data;
    if (gpu.data.findItemsAdvancedResponse[0].searchResult[0]['@count'] > 0) {
      for (const i of gpu.data.findItemsAdvancedResponse[0].searchResult[0].item) {
        // price = price + shipping cost
        // shipping price cannot be determined if calculated method is used
        if (i.shippingInfo[0].shippingServiceCost) {
          price = i.sellingStatus[0].currentPrice[0].__value__ + i.shippingInfo[0].shippingServiceCost[0].__value__;
        } else {
          price = i.sellingStatus[0].currentPrice[0].__value__;
        }

        // push data to postgres db
        // clients will also use environment variables
        // for connection information
        addToDB(gpu, i, price);
      }
    }
  });
}

async function addToDB(gpu, i, price) {
  // has result if needed
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack);
    }
    client.query('IF \
      (EXISTS\
      (SELECT * FROM gpudb WHERE gpu = ' + gpu + ' AND title = ' + i.title +' AND itemurl = ' + i.viewItemURL + ' AND imageurl = ' + i.galleryURL + ' AND price = ' + price + '))\
      BEGIN \
      UPDATE gpudb SET available TRUE WHERE WHERE gpu = ' + gpu + ' AND title = ' + i.title +' AND itemurl = ' + i.viewItemURL + ' AND imageurl = ' + i.galleryURL + ' AND price = ' + price + '\
      END \
      ELSE \
      BEGIN \
      INSERT INTO gpudb (gpu, title, itemurl, imageurl, price, currency, available) VALUES (' + gpu + ', ' + i.title + ', ' + i.viewItemURL + ', ' + i.galleryURL + ', ' + price + ', ' + CURRENCY + ', TRUE)\
      END', (err, res) => {
      release();
      if (err) return console.error('Error executing query', err.stack);
    });
  });
}

async function purgeUnavailable() {
  // remove all listings found to now be "unavailable"
  // clients will also use environment variables
  // for connection information
  // has result if needed
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack);
    }
    client.query('DELETE FROM gpudb \
      WHERE (available, FALSE) IN \
      ( SELECT available, FALSE FROM gpudb )', (err, res) => {
      release();
      if (err) return console.error('Error executing query', err.stack);
    });
  });
  return;
}
