# GPUCompare-Dockerized

## To be done

- Switch from json files to SQL server queries
- Inter-container networking/volumes
	- API to become internal
- Need to implement options for **dev** and **production**
	- Currently nginx server serves on port 80 regardless
- Re-implement API
- Make rust script run as service
- Improve Angular build times
- Switch from dark to light mode
- Improve mobile experience

## Install (docker)

- `docker-compose up --build`

## Install (to be run by docker)

- `pip install -r GPUCompare/requrements.txt
- `cd gpucomp_api && sudo openssl req -x509 -nodes -days 73000 -newkey rsa:2048 -subj "/CN=gpu.mhwdvs.com" -keyout privkey.pem -out fullchain.pem && cd ..`
- `sudo apt install libssl-del pkg-config`
- `cargo run`
- `cd gpucomp_api && npm install && npm start && cd ..`
- `cd gpucompare-angular && npm install && ng serve && cd ..`
	- Or use `ng build` to create the files to be hosted by a web server


### MongoDB (yet to be implemented)

- `curl -fsSL https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -`
- `echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
- `sudo apt update`
- `sudo apt install mongodb-org`
- `sudo systemctl start mongod.service`


## Design

- Python to scrape GPU performance scores from 3DMark
- Rust to call eBay API for listings of each GPU, and sort all of the listings by *price/performance ratio*
- Express JS API to provide Angular with data from 
- Angular to run web server

### Potential changes

- Replace Express with SQL server
