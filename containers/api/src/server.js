const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 60777;
const https = require('https');
const cors = require('cors');
//expect incomming body to be in JSON format
app.use(express.json());

let fs = require("fs");
let gpus_file = fs.readFileSync("/var/local/commonfiles/gpudb.json");
gpus_file = JSON.parse(gpus_file);
let outtime = fs.readFileSync("/var/local/commonfiles/outtime.json");
outtime = JSON.parse(outtime);

// init gpus
let sorted_gpus = [];
let gpu_list = [];
let listing_number = 0;
for(let gpu of gpus_file){
	gpu_list.push({"name": gpu.name, "brand": gpu.brand, "relative": gpu.relative});
	if(gpu.data.findItemsAdvancedResponse[0].searchResult[0]['@count'] > 0){
		for(let i of gpu.data.findItemsAdvancedResponse[0].searchResult[0].item){
			let min_gpu = {
				title: i.title,
				gpu: gpu.name,
				brand: gpu.brand,
				price: -1,
				perf: gpu.relative,
				ppp: -1,
				itemurl: i.viewItemURL,
				imageurl: i.galleryURL
			};
			// price = price + default shipping method
			// no shipping price can be found if shipping is calculated
			if(i.shippingInfo[0].shippingServiceCost){
				min_gpu.price = Number(i.sellingStatus[0].currentPrice[0].__value__) + Number(i.shippingInfo[0].shippingServiceCost[0].__value__);
			}
			else{
				min_gpu.price = Number(i.sellingStatus[0].currentPrice[0].__value__) + 15;
			}
			min_gpu.ppp = min_gpu.price/min_gpu.perf;
			sorted_gpus.push(min_gpu);
			++listing_number;
		}
	}
}
sorted_gpus.sort(function(a,b){
	return a.ppp - b.ppp;
});

app.post('/get_listings', cors(), (req, res) => {
	// create a new entry here
	console.log(req.body);
	res.setHeader('Access-Control-Allow-Origin', 'https://' + process.env.DOMAIN_NAME);
	res.setHeader('Access-Control-Allow-Methods', 'POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin');
	// check that request has required data
	if(req.body.filters && req.body.count && req.body.first != null){
		let filters = req.body.filters;
		let count = req.body.count;
		let first = req.body.first;

		let match_count = 0;
		let current = 0;
		let matches = [];
		while(match_count < count && current < listing_number){
			let gpu = sorted_gpus[current];
			let match = true;
			for(let property in filters){
				let value = filters[property];
				// only continue if filter exists and can still possibly be a match
				if(value != "" && match == true){
					switch(property){
						case "specific":
							if(gpu.gpu != value){
								match = false;
							}
							break;
						case "minperf":
							if(gpu.perf < value){
								match = false;
							}
							break;
						case "brand":
							if(gpu.brand != value){
								match = false;
							}
							break;
						case "min":
							if(gpu.price < value){
								match = false;
							}
							break;
						case "max":
							if(gpu.price > value){
								match = false;
							}
							break;
					}
				}
			}
			if(match && current >= first){
				++match_count;
				matches.push(gpu);
			}
			++current;
		}
		let to_be_sent = {};
		to_be_sent.matches = matches;
		to_be_sent.match_count = match_count;
		to_be_sent.success = true;
		to_be_sent.no_matches = false;
		to_be_sent.end_of_listings = false;
		to_be_sent.outtime = outtime;
		if(matches.length != count){
			// no matches found or end of listings
			if(match_count == 0){
				// no matches found
				to_be_sent.no_matches = true;
			}
			else{
				// end of listings
				to_be_sent.end_of_listings = true;
			}
		}
		res.send(to_be_sent);
	}
	else{
		res.send("ERROR: Incorrect number of incomming JSON objects. Expected filters object, count int and first int");
	}
});

app.get('/get_gpus', cors(), (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', 'https://' + process.env.DOMAIN_NAME);
	res.setHeader('Access-Control-Allow-Methods', 'POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Origin');
	return res.send(gpu_list);
});

app.options('/get_listings', cors()) // include before other routes
app.options('/get_gpus', cors()) // include before other routes

https.createServer({
	key: fs.readFileSync("./certs/privkey.pem"),
	cert: fs.readFileSync("./certs/fullchain.pem")
}, app)
.listen(port, () => {console.log("Live on port " + port);});
