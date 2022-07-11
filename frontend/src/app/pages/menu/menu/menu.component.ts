import { Component, OnInit } from '@angular/core';
import { FoodItemService } from 'src/app/shared/food-item.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  constructor(private service:FoodItemService) { }

  foodItems:any;

  ngOnInit(): void {
    this.foodItems = this.service.foodDetails;
  }

}