import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurentDetails } from './restaurent-details';

describe('RestaurentDetails', () => {
  let component: RestaurentDetails;
  let fixture: ComponentFixture<RestaurentDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurentDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurentDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
