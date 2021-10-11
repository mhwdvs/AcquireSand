import {HttpClient} from '@angular/common/http';
import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';

import {environment} from '../../../environments/environment';

enum ResultsStatus {
  Loading = 1,
  Normal = 2,
  NoMore = 3,
  None = 4
}

@Component({
  selector: 'app-gpu-search',
  templateUrl: './gpu-search.component.html',
  styleUrls: ['./gpu-search.component.css']
})
export class GpuSearchComponent implements OnInit {
  @ViewChild('anchor') anchor: ElementRef;
  listings = [];  // gpu listings to be displayed
  total_matching_listings = '???';
  listing_batch_size = 10;  // number of listings to be obtained by each POST rq
  is_scrolling = false;
  currentfilters = {
    specific: '',
    minperf: '',
    brand: '',
    min: '',
    max: ''
  };  // current search filters

  // User-facing vars:
  last_update;                 // time of last database update
  rs = ResultsStatus.Loading;  // Status of results

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get(environment.get_gpus_endpoint, {})
        .subscribe(
            (val: any) => {
              console.log('Post call successful value returned in body', val);
            },
            response => {
              console.log('POST call in error', response);
            },
            () => {
              console.log('The POST observable is now completed.');
            });
    // get initial listings
    this.add_listings(this.listings.length + 1, this.listing_batch_size);
  }

  // called whenever a change is made to any filters
  change(value: any, field: string) {
    // clear currently displayed gpus
    this.listings = [];
    // update filters
    this.currentfilters[field] = value;
    // add new listings
    this.add_listings(this.listings.length + 1, this.listing_batch_size);
  }

  // get next batch of gpus
  // get listings from API
  add_listings(offset: number, limit: number) {
    this.rs = ResultsStatus.Loading;
    this.http
        .post(environment.get_listings_endpoint, {
          // request body
          'filters': this.currentfilters,
          'count': limit,
          'first': offset
        })
        .subscribe(
            (val: any) => {
              console.log('Post call successful value returned in body', val);

              let prev_len = this.listings.length;

              for (let i of val.matches.rows) {
                this.listings.push(i);  // update listings
              }

              if (this.listings.length == 0 && offset == 0) {
                this.rs = ResultsStatus.None;
                console.log('none listings ig')
              } else if (this.listings.length < prev_len + limit) {
                this.rs = ResultsStatus.NoMore;
              }
              this.is_scrolling = false;
            },
            response => {
              console.log('POST call in error', response);
            },
            () => {
              console.log('The POST observable is now completed.');
              // don't overwrite non-loading status
              if (this.rs == ResultsStatus.Loading) {
                this.rs = ResultsStatus.Normal;
              }
            });
  }

  scroll_top() {
    document.body.scrollTop = 0;  // For Safari
    document.documentElement.scrollTop =
        0;  // For Chrome, Firefox, IE and Opera
  }

  @HostListener('window:scroll', ['$event'])
  scroll_event() {
    let anchorpos = this.anchor.nativeElement.getBoundingClientRect().top
    let topBtn = document.getElementById('topBtn');
    // check if anchor is in view
    if (!this.is_scrolling && anchorpos < window.innerHeight) {
      this.is_scrolling = true;
      // anchor is in view, add gpus to dom object
      this.add_listings(this.listings.length + 1, this.listing_batch_size);
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