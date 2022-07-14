import { DatePipe } from '@angular/common';
import { StringMap } from '@angular/compiler/src/compiler_facade_interface';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Order, ProductsInOrder } from 'src/app/shared/models/order.model';
import { Product } from 'src/app/shared/models/product.model';
import { UserService } from 'src/app/shared/user.service';
import { BuyerService } from '../buyer.service';
import { NewOrder, ProductInNewOrder } from '../models/newOrder.model';
import * as signalR from '@microsoft/signalr';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-buyer',
  templateUrl: './buyer.component.html',
  styleUrls: ['./buyer.component.css']
})
export class BuyerComponent implements OnInit {

  constructor(private userservice: UserService, private service:BuyerService, private router: Router, private toastr: ToastrService, private datepipe:DatePipe) { }
  @Input() email = "";

  newOrderForm = new FormGroup({
    Address: new FormControl('', Validators.required),
    Comment: new FormControl('')
  });
  
  panelOpenState:boolean = false;
  panelOpenState1:boolean = false;
  hasActiveOrder:boolean = false;
  foodItems: ProductsInOrder[] = [];
  foodItemsMap: Map<number,Product> = new Map<number,Product>(); 
  foodItemsAvailabe:boolean = false;
  activeOrder:Order = new Order();
  orderMessage:string = '';
  timerMin:string = "0";
  timerSec:string = "0";
  previousOrders:Order[] = [];

  ngOnInit(): void {
      // get all products for order
      this.foodItems = [];
      this.foodItemsMap = new Map<number,Product>(); 

      this.userservice.getAllProducts().subscribe({
      next: (data) => {
        this.foodItemsAvailabe = true;
        for(let p of data){
          this.foodItems.push(new ProductsInOrder(p.id,0));
          this.foodItemsMap.set(p.id,p);
        }
      },
      error: (error) => {
        this.foodItemsAvailabe = false;
      }
      });

    //check for active order
    this.checkForActiveOrder();

    this.getPreviousOrders();
  
    this.timerTick();
  }

  getPreviousOrders(){
    //get previous orders
    this.service.getPreviousOrders().subscribe({
      next: (data : Order[]) => {
        this.previousOrders = data;
      },
      error: (error) => {
        this.toastr.error('User data retrieval failed.');
      }
    });
  }

  connectWithSignalR(){
    let temp = localStorage.getItem('token');
    let token = temp !== null ? temp : "";

    const connection = new signalR.HubConnectionBuilder()  
      .configureLogging(signalR.LogLevel.Information)  
      .withUrl(environment.serverURL + '/inform', {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
        accessTokenFactory: () => token
      })  
      .build();  
  
    connection.start().then(function () {  
      console.log('SignalR Connected!');  
    }).catch(function (err) {  
      return console.error(err.toString());  
    });  
  
    connection.on("BroadcastMessage", () => {  
      this.ngOnInit();  
    });
  }

  checkForActiveOrder(){
    this.service.getActiveOrder().subscribe({
      next: (data) => {
        if(data === null)
        {
          this.activeOrder = new Order();
          this.hasActiveOrder = false;
          this.orderMessage = "New";
        }
        else{
          this.activeOrder = data;
          this.hasActiveOrder = true;
          this.orderMessage = "Current";
          this.connectWithSignalR();
          this.timerTick();
        }
      },
      error: (error) => {
        this.toastr.error(error.error, 'Order load failed');
      }
    });
  }

  get priceDisplayValue(){
    let price = 0;
    for(let p of this.foodItems){
      price += this.foodItemsMap.get(p.productId)!.price * p.quantity;
    }

    if(price > 0)
      price += 200;

    return price;
  }

  onOrder(){
    if(this.newOrderForm.invalid){
      this.toastr.error('Fill all the fields', 'Order failed.');
      return;
    }

    let newOrder:NewOrder = new NewOrder();
    newOrder.buyerEmail = this.email;
    newOrder.address = this.newOrderForm.controls['Address'].value;
    newOrder.comment = this.newOrderForm.controls['Comment'].value;
    for(let p of this.foodItems){
      if(p.quantity > 0)
        newOrder.productsInOrder.push(new ProductInNewOrder(0,p.productId,p.quantity));
    }

    this.service.placeNewOrder(newOrder).subscribe({
      next: (data) => {
        this.ngOnInit();
      },
      error: (error) => {
        this.toastr.error(error.error, 'Error during ordering');
      }
    });
  }

  interval:any = null;

  async timerTick(){
    if(this.interval === null && this.activeOrder.deliveryEmail){
      this.interval = setInterval(() => {
        if(this.hasActiveOrder){
          let now = new Date();
          let before = this.activeOrder.deliveryTime;
          this.datepipe.transform(now);

          if(now.getTime() > new Date(before).getTime())
            this.stopTimer();

          let timeSec = (new Date(before).getTime() - now.getTime())  / 1000;
          var timerMin = Math.floor(timeSec / 60);
          var timerSec = Math.floor(timeSec - timerMin * 60);
          if(timerMin >= 10)
            this.timerMin = timerMin.toString();
          else
            this.timerMin = "0" + timerMin.toString();
          if(timerSec >= 10)
            this.timerSec = timerSec.toString();
          else
            this.timerSec = "0" + timerSec.toString();
        }
        else{
          this.stopTimer();
        }
      },1000)
    }
  }

  stopTimer(){
    clearInterval(this.interval);
    this.interval = null;
    this.hasActiveOrder = false;
    this.activeOrder = new Order();
  }

}
