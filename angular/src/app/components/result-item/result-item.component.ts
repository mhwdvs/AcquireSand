import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-result-item',
  templateUrl: './result-item.component.html',
  styleUrls: ['./result-item.component.css']
})
export class ResultItemComponent {
  @Input() gpu:any;
  @ViewChild('dial') dial_el: ElementRef;

  degToRad(degrees) {
    return degrees * Math.PI / 180;
  };

  ngOnInit() {
    console.log("making graph!");
    
  }

  ngAfterViewInit(){
    // unsure if this searches component or whole page
    const canvas = this.dial_el.nativeElement;

    canvas.height = 60;
    canvas.width = 100;
    const ctx = canvas.getContext('2d');
    let ppp = this.gpu.ppp;

    // price
    ctx.beginPath();
    ctx.moveTo(20,55);
    ctx.arc(50, 55, 45, this.degToRad(-180), this.degToRad(-80), false);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 8;
    ctx.stroke(); 
  }
}
