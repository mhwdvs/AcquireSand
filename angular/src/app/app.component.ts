import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  how = false;
  gpu = true;

  show_how(){
    this.how = true;
    this.gpu = false;
  }

  show_gpu(){
    this.gpu = true;
    this.how = false;
  }
}
