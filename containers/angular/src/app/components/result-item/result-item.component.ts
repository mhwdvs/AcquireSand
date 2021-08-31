import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-result-item',
  templateUrl: './result-item.component.html',
  styleUrls: ['./result-item.component.css']
})
export class ResultItemComponent {
  @Input() gpu: any;
  @ViewChild('dial') dial_el: ElementRef;

  degToRad(degrees) {
    return degrees * Math.PI / 180;
  };

  ngOnInit() {}

  ngAfterViewInit() {}
}
