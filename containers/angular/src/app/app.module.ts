import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GpuSearchComponent } from './components/gpu-search/gpu-search.component';
import { ResultItemComponent } from './components/result-item/result-item.component';
import { HowItWorksComponent } from './components/how-it-works/how-it-works.component';
import { SearchResultsComponent } from './components/search-results/search-results.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    GpuSearchComponent,
    ResultItemComponent,
    HowItWorksComponent,
    SearchResultsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
