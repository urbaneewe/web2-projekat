import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FoodItemService } from 'src/app/shared/food-item.service';
import { UserService } from 'src/app/shared/user.service';
import jwt_decode from "jwt-decode";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  constructor(private service:UserService) { }

  foodItems:any;
  foodItemsAvailabe:boolean = false;
  canPurchase:boolean = false;
  decoded:any;

  ngOnInit(): void {
    this.service.getAllProducts().subscribe({
      next: (data) => {
        this.foodItemsAvailabe = true;
        this.foodItems = data;
      },
      error: (error) => {
        this.foodItemsAvailabe = false;
      }
    });

    if (localStorage.getItem('token') != null){
      const temp = localStorage.getItem('token');
      let token = temp !== null ? temp : "";
      this.decoded = jwt_decode(token);
      let role = this.decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      if(role == "buyer" || role == "social")
        this.canPurchase = true;
      else
      this.canPurchase = false;
    }
  }

}
