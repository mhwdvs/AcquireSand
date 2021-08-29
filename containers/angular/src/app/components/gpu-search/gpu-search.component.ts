import {HttpClient} from '@angular/common/http';
import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';

import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-gpu-search',
  templateUrl: './gpu-search.component.html',
  styleUrls: ['./gpu-search.component.css']
})
export class GpuSearchComponent implements OnInit {
  @ViewChild('anchor') anchor: ElementRef;
  gpus = [];
  gpu_list = [];
  next_listing_index = 0;
  listing_batch_size = 10;
  listing_number = 0;
  spinner = true;
  adding_listings = false;
  currentfilters = {specific: '', minperf: '', brand: '', min: '', max: ''};
  last_update;
  no_more_results = false;
  no_results = false;
  end_of_results = false;
  // temp
  original_data = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // get gpu list
    this.http.get(environment.get_gpus_endpoint, {})
        .subscribe(
            (val: any) => {
              console.log('Post call successful value returned in body', val);
              this.original_data = val;
            },
            response => {
              console.log('POST call in error', response);
            },
            () => {
              console.log('The POST observable is now completed.');
            });
    // get initial listings
    this.add_listings(0, this.listing_batch_size);
  }

  // called whenever a change is made to any filters
  change(value: any, field: string) {
    // clear currently displayed gpus
    this.gpus = [];
    // update filters
    this.currentfilters[field] = value;
    // add new listings
    this.next_listing_index = 0;
    this.add_listings(this.next_listing_index, this.listing_batch_size);
    this.next_listing_index += this.listing_batch_size - 1;
  }

  // filters and pushes
  add_listings(first: number, required: number) {
    // get next batch of gpus
    // get listings from API
    this.http
        .post(environment.get_listings_endpoint, {
          // request body
          'filters': this.currentfilters,
          'count': this.listing_batch_size,
          'first': first
        })
        .subscribe(
            (val) => {
              console.log('Post call successful value returned in body', val);
              // this.next_listing_index += val.match_count;
              for (let i of val.matches.rows) {
                this.gpus.push(i);
              }
              if (first == 0) {
                // update last_updated, Unix epoch in seconds to milliseconds
                // (*1000)
                this.last_update = new Date(val.outtime * 1000);
              }

              /*
              if(val.end_of_listings){
                this.end_of_results = true;
                this.no_more_results = true;
                this.no_results = false;
              }
              else if(val.no_matches){
                this.end_of_results = true;
                this.no_more_results = false;
                this.no_results = true;
              }
              else {
                this.end_of_results = false;
                this.no_more_results = false;
                this.no_results = false;
              }*/
            },
            response => {
              console.log('POST call in error', response);
            },
            () => {
              console.log('The POST observable is now completed.');
              this.adding_listings = false;
            });
  }

  scroll_top() {
    document.body.scrollTop = 0;  // For Safari
    document.documentElement.scrollTop =
        0;  // For Chrome, Firefox, IE and Opera
  }

  @HostListener('window:scroll', ['$event'])
  scroll_event() {
    let anchorpos = this.anchor.nativeElement.getBoundingClientRect()
    let topBtn = document.getElementById('topBtn');
    // check if anchor is in view
    if (anchorpos.top < window.innerHeight) {
      // anchor is in view, add gpus to dom object
      if (this.adding_listings == false) {
        this.adding_listings = true;
        this.add_listings(this.next_listing_index, this.listing_batch_size);
      }
    }
    // Check if top is out of view
    if (document.body.scrollTop > 20 ||
        document.documentElement.scrollTop > 20) {
      topBtn.style.display = 'block';
    } else {
      topBtn.style.display = 'none';
    }
  }
}