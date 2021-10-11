// postgres
const {Pool} = require('pg');
const pool = new Pool();

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// got http client
const got = require('got');

loop();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// database update loop
async function loop() {
  while (true) {
    try {
      await main();
    } catch (e) {
      console.error(e);
    }

    console.log('Sleeping for 60 minutes!');
    await sleep(2 * 60 * 60 * 1000); // sleep for 2 hoours
  }
}

async function main() {
  gpuList = [];
  // get all gpulist
  // Getting GPU list from database
  try {
    gpuList = await getGPUList();
  } catch (e) {
    console.error(
        'Error in getting GPU list from database' + e.name + e.message);
    return;
  }

  // Getting new ebay listings and updating database
  try {
    await getListings(gpuList);
  } catch (e) {
    console.log(
        'Error in getting new ebay listings and updating database' + e.name +
        e.message);
    return;
  }
}

async function getGPUList() {
  // get all gpulist
  try {
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
      // replace spaces with + to be suitable for url request format
      res.push(gpulist.rows[i].name.split(' ').join('+'));
    }
    // Got gpu list!
    return res
  } catch (err) {
    console.error('Error getting GPU List: ' + err.name + err.message);
    throw err;
  }
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
  const url = [
    'https://svcs.ebay.com/services/search/FindingService/v1?' +
    'OPERATION-NAME=findItemsAdvanced&' +
    'SERVICE-VERSION=1.13.0&' +
    'SECURITY-APPNAME=' + process.env.EBAY_API_KEY + '&' +
    'RESPONSE-DATA-FORMAT=JSON&' +
    'REST-PAYLOAD=true&' +
    'GLOBAL-ID=EBAY-' + COUNTRY + '&' +
    'affiliate.networkId=9&' +            // SHOULD BE VARIABLE
    'affiliate.trackingId=5338664158&' +  // SHOULD BE VARIABLE
    // ITEM FILTERS
    // additional item filters can be found at
    // https://developer.ebay.com/devzone/finding/callref/types/ItemFilterType.html
    'itemFilter(0).name=Condition&' +
    'itemFilter(0).value(0)=3000&' +  // Used
    'itemFilter(0).value(1)=1000&' +  // New
    'itemFilter(0).value(2)=1500&' +  // New (other, see item details
    'itemFilter(0).value(3)=2000&' +  // Manufacturer refurbished
    'itemFilter(0).value(4)=4000&' +  // Very good
    'itemFilter(0).value(5)=5000&' +  // Good
    'itemFilter(0).value(6)=6000&' +  // Acceptable
    'itemFilter(1).name=ListingType&' +
    'itemFilter(1).value(0)=FixedPrice&' +
    'itemFilter(1).value(1)=AuctionWithBIN&' +
    'itemFilter(1).value(2)=StoreInventory&' +
    'itemFilter(2).name=LocalPickupOnly&' +
    'itemFilter(2).value=false&' +
    'itemFilter(3).name=Currency&' +
    'itemFilter(3).value=' + CURRENCY + '&' +  // LOCALISATION TARGET
    'itemFilter(4).name=LocatedIn&' +
    'itemFilter(4).value=' + COUNTRY + '&' +  // LOCALISATION TARGET
    'keywords=' + gpu +                       // The gpu  being searched for
    '+-cooler+-performance+-like+-backplate+-waterblock+-block+-bykski+-buying+-bracket+-fan+-fans+-replacement+-mosfet+-powerlink+-bios+-nvlink+-kit+-suits+-faulty+-1080p+-description&' +  // Blacklisted terms
    'LH_PrefLoc=1&' +  // Only show items within region selected
    'categoryId=27386&' +
    'paginationInput.entriesPerPage=100&' +  // redundent?
    'sortOrder=PricePlusShippingLowest'
  ].join();


  await (async () => {
    try {
      // returns response
      const response = await got(url);
      const body = JSON.parse(response.body);
      if (body.findItemsAdvancedResponse[0].searchResult[0]['@count'] > 0) {
        for (const i of body.findItemsAdvancedResponse[0]
                 .searchResult[0]
                 .item) {
          // price = price + shipping cost
          // shipping price cannot be determined if calculated method is used
          if (i.shippingInfo[0].shippingServiceCost) {
            price = parseFloat(i.sellingStatus[0].currentPrice[0].__value__) +
                parseFloat(i.shippingInfo[0].shippingServiceCost[0].__value__);
          } else {
            price = parseFloat(sellingStatus[0].currentPrice[0].__value__);
          }
          addToDB(gpu.replace(/\+/g, ' '), i, price);
        }
      }
    } catch (error) {
      console.log(error);
    }
  })();
}

async function addToDB(gpu, i, price) {
  // has result if needed
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack);
    }
    client.query(
        'INSERT INTO gpudb (gpu, title, itemurl, imageurl, price, currency) VALUES (' +
            '(SELECT name FROM gpulist WHERE name=\'' + gpu + '\')' +
            ', \'' + i.title + '\', \'' + i.viewItemURL + '\', \'' +
            i.galleryURL + '\', ' + price +
            ', \'AUD\')',  // TODO CURRENCY is hardcoded
        (err, res) => {
          release();
          if (err) return console.error('Error executing query', err.stack);
        });
  });
}
