#![deny(warnings)]

extern crate json;
extern crate dotenv;

use std::env;
use std::fs::File;
use std::path::Path;
use std::io::prelude::*;
use std::io::{Error};
use std::{time};

// This is using the `tokio` runtime. You'll need the following dependency:
//
// `tokio = { version = "0.2", features = ["macros"] }`
#[tokio::main]
async fn get_req(gpu: String) -> Result<String, reqwest::Error> {
    let borrowed_gpu = &gpu;  // Needs to be a borrowed string to use replace function
    let formatted_gpu = str::replace(borrowed_gpu, " ", "+");

    // https://developer.ebay.com/docs#Finding
    let mut url = "https://svcs.ebay.com/services/search/FindingService/v1?".to_string();
    url.push_str("OPERATION-NAME=findItemsAdvanced&");
    url.push_str("SERVICE-VERSION=1.13.0&");
    url.push_str("SECURITY-APPNAME=");
    url.push_str(env::var("EBAY_API_KEY").unwrap().as_str());
    url.push_str("&");  // My API key, should eventually be moved to external file
    url.push_str("RESPONSE-DATA-FORMAT=JSON&");
    url.push_str("REST-PAYLOAD=true&");
    url.push_str("GLOBAL-ID=EBAY-AU&");  // eBay region
    url.push_str("affiliate.networkId=9&");
    url.push_str("affiliate.trackingId=5338664158&");
    // additional item filters can be found at https://developer.ebay.com/devzone/finding/callref/types/ItemFilterType.html
    url.push_str("itemFilter(0).name=Condition&");
    url.push_str("itemFilter(0).value(0)=3000&");  // Used
    url.push_str("itemFilter(0).value(1)=1000&");  // New
    url.push_str("itemFilter(0).value(2)=1500&");  // New (other, see item details)
    url.push_str("itemFilter(0).value(3)=2000&");  // Manufacturer refurbished
    url.push_str("itemFilter(0).value(4)=4000&");  // Very good
    url.push_str("itemFilter(0).value(5)=5000&");  // Good
    url.push_str("itemFilter(0).value(6)=6000&");  // Acceptable
    url.push_str("itemFilter(1).name=ListingType&");
    url.push_str("itemFilter(1).value(0)=FixedPrice&");
    url.push_str("itemFilter(1).value(1)=AuctionWithBIN&");
    url.push_str("itemFilter(1).value(2)=StoreInventory&");
    url.push_str("itemFilter(2).name=LocalPickupOnly&");
    url.push_str("itemFilter(2).value=false&");
    url.push_str("itemFilter(3).name=Currency&");
    url.push_str("itemFilter(3).value=AUD&");
    url.push_str("itemFilter(4).name=LocatedIn&");
    url.push_str("itemFilter(4).value=AU&");
    url.push_str("keywords=");
    url.push_str(formatted_gpu.as_str());  // GPU to search for
    url.push_str("+-cooler+-performance+-like+-backplate+-waterblock+-buying+-bracket+-fan+-fans+-replacement+-mosfet+-powerlink+-bios+-nvlink+-kit+-suits+-faulty+-1080p+-description&");  // Keyword blacklist
    url.push_str("LH_PrefLoc=1&");  // Only shows items within region
    url.push_str("categoryId=27386&");
    url.push_str("paginationInput.entriesPerPage=100&"); 
    url.push_str("sortOrder=PricePlusShippingLowest");  // Sorts from low to high
    
    let res = reqwest::get(&url).await?;
    //println!("Status: {}", res.status());
    let body = res.text().await?;
    //println!("Body:\n\n{}", body);

    Ok(body)
}

// Reads CSV and initiates requests
fn read_json() -> Result<String, Error> {
    let mut input = File::open("/var/local/commonfiles/gpudb.json")?;
    let mut contents = String::new();
    input.read_to_string(&mut contents)?;
    let mut parsed = json::parse(&contents).unwrap();
    for i in 0..parsed.len(){
        //println!("{:?}", gpu);  // Print GPU name
        // Make eBay API request
        let res = json::parse(get_req(parsed[i]["name"].to_string()).unwrap().as_str()).unwrap();
        // Add API request result to string of results
        parsed[i]["data"] = res.into();
    }
    // Now that each gpu has been searched for, we need to return all of the json data to be parsed and written
    Ok(parsed.dump())
}

// Writes string to out.json file
fn write_file(data: String, pathstr: String) {
    let path = Path::new(&pathstr);
    let display = path.display();

    let mut file = match File::create(&path) {
        Err(why) => panic!("couldnt create {}: {}", display, why),
        Ok(file) => file,
    };

    match file.write_all(data.as_bytes()) {
        Err(why) => panic!("couldnt create {}: {}", display, why),
        Ok(_) => println!("successfully wrote to {}", display),
    }
}

fn write_time()
{
    let mut time = String::new();
    // Add timestamp to a different file
    match time::SystemTime::now().duration_since(time::SystemTime::UNIX_EPOCH) {
        Ok(n) => time.push_str(n.as_secs().to_string().as_str()),
        Err(_) => panic!("SystemTime before UNIX_EPOCH!"),
    }
    write_file(time, "./outtime".to_string())
}

fn main() {
    //use dotenv;
    dotenv::dotenv().ok();

    // Read CSV input, return JSON search results
    let gpujson = read_json().unwrap();
    // Write output
    write_file(gpujson, "/var/local/commonfiles/gpudb.json".to_string());
    write_time();
    println!("Done!");
}
