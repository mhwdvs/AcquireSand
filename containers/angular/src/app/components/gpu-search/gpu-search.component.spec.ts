import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GpuSearchComponent } from './gpu-search.component';

describe('SearchFiltersComponent', () => {
  let component: GpuSearchComponent;
  let fixture: ComponentFixture<GpuSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GpuSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GpuSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
