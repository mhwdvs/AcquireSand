# GPUCompare-Dockerized

## To be done

- Switch from json files to SQL/mongodb server queries
- Inter-container networking/volumes
	- API to become internal, then web server forwards requests?
- Need to implement options for **dev** and **production**
	- Currently nginx server serves on port 80 regardless
- Re-implement API
- Make rust script run as service
- Improve Angular build times
- Switch from dark to light mode
- Improve mobile experience
- Add easy to change environment variables for ports, domains, etc.

## Install

- Install docker
- Install docker-compose
- Modify environments to suit deployment needs (e.g. production environment serves non-standard ports to be served by a reverse proxy implementation on target machine)

### Development Environment
- `docker-compose up --build`

### Production Environment
- `docker-compose -f docker-compose-prod.yml up -d`

### To repurpose
- Change all references of "gpu.mhwdvs.com" to the domain you desire
- Modify ports as required

## To be run by docker

- Install python requirements
`pip install -r GPUCompare/requrements.txt`
- Generate SSL keys for HTTPS
```
// Change "gpu.mhwdvs.com" to the url the webservice will be hosed on
cd gpucomp_api && sudo openssl req -x509 -nodes -days 73000 -newkey rsa:2048 -subj "/CN=gpu.mhwdvs.com" -keyout privkey.pem -out fullchain.pem && cd ..
sudo apt install libssl-del pkg-config
```
- Install rust dependancies and run
`cargo run`
- Install TS dependancies and run
`cd gpucomp_api && npm install && npm start && cd ..`
- Install TS dependancies and run
	- Or use `ng build --watch` to create files to be hosted by a web server
`cd gpucompare-angular && npm install && ng serve && cd ..`

## Design

- Python to scrape GPU performance scores from 3DMark
- Rust to call eBay API for listings of each GPU, and sort all of the listings by *price/performance ratio*
- Express JS API to provide Angular with data from 
- Angular to run web server

### Potential changes

- Replace Express with SQL server
