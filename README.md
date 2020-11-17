# GPUCompare-Dockerized

## To be done

- Switch from json files to SQL/mongodb server queries
- Inter-container networking/volumes
	- API to become internal, then web server forwards requests?
	- Seems redundant
- Re-implement API
- Make rust script run as service
- Improve Angular build times
- Switch from dark to light mode
- Improve mobile experience
- Add easy to change environment variables for ports, domains, etc.

## Install

- Install **docker**
- Install **docker-compose**
- Add `.env` files to both `/local` and `/production` directories with the following contents:
	- (feel free to edit to your preferences, if its implemented right the values shouldnt effect functionality!)
	- Email address is only used in production for getting notifications from LetsEncrypt
	- EBAY_API_KEY must be obtained from https://developer.ebay.com, and will be your *App ID (Client ID)* - it's not a key/secret really, but probably not ideal to be shared due to rate limits
```
DOMAIN_NAME=example.com
EMAIL_ADDRESS=me@example.com
EBAY_API_KEY=your_api_key
HTTP_PORT=80
HTTPS_PORT=443
API_PORT=60777
```
- Edit nginx.conf (probably just in production) to suit your deployment

### Development Environment
- `cd local && docker-compose up --build`

### Production Environment
- `cd production && docker-compose up -d`

## Design

- Python to scrape GPU performance scores from 3DMark
- Rust to call eBay API for listings of each GPU, and sort all of the listings by *price/performance ratio*
- Express JS API to provide Angular with data from 
- Angular to run web server

### Potential changes

- Replace Express with SQL server
