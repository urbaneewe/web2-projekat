import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Order, ProductsInOrder } from 'src/app/shared/models/order.model';
import { Product } from 'src/app/shared/models/product.model';
import { UserService } from 'src/app/shared/user.service';
import { DeliveryService } from '../delivery.service';
import { Delivery } from '../models/delivery.model';
import { OrderConfirmation } from '../models/orderconfirmation.model';
import { DatePipe, formatDate } from '@angular/common';

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.css']
})
export class DeliveryComponent implements OnInit {

  constructor(private userservice: UserService, private service: DeliveryService, private router: Router, private toastr: ToastrService, private datepipe:DatePipe) { }
  @Input() email = "";

  panelOpenState:boolean = false;
  panelOpenState1:boolean = false;
  status:string = "";
  hasActiveOrder:boolean = false;
  activeOrder:Order = new Order();
  foodItems: ProductsInOrder[] = [];
  foodItemsMap: Map<number,Product> = new Map<number,Product>(); 
  foodItemsAvailabe:boolean = false;
  orderMess:string = "";
  unconfirmedOrders: Order[] = [];
  hasUnconfirmedOrders:boolean = false;
  timerMin:string = "0";
  timerSec:string = "0";
  previousOrders: Order[] = [];

  ngOnInit(): void {
    this.foodItems = [];
    this.foodItemsMap = new Map<number,Product>(); 

    this.service.getDeliveryInfo().subscribe({
      next: (data : Delivery) => {
        console.log(data.status);
        if(data.status == 0){
          this.status = "Na cekanju";
          return;
        }
        if(data.status == 1)
          this.status = "Prihvacen";
        if(data.status == 2){
          this.status = "Odbijen";
          return;
        }
      },
      error: (error) => {
        this.toastr.error('User retrieval failed');
        return;
      }
    });

    // get all products
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
    this.service.getActiveOrder().subscribe({
      next: (data) => {
        if(data === null)
        {
          this.activeOrder = new Order();
          this.hasActiveOrder = false;
          //ucitavanje neaktivnih porudzbina
          this.checkForUnconfirmedOrders();
        }
        else{
          this.activeOrder = data;
          this.hasActiveOrder = true;
        }
      },
      error: (error) => {
        this.toastr.error(error.error, 'Error during write');
      }
    });
    
    if(this.hasActiveOrder)
      this.orderMess = "State of active order";
    else
      this.orderMess = "Avaliable orders";

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
        this.toastr.error('Error');
      }
    });
  }

  checkForUnconfirmedOrders(){
    this.service.getUnconfirmedOrders().subscribe({
      next: (data) => {
        this.unconfirmedOrders = data;
        if(this.unconfirmedOrders.length == 0){
          this.hasUnconfirmedOrders = false;
        }
        else{
          this.hasUnconfirmedOrders = true;
        }
      },
      error: (error) => {
        this.toastr.error(error.error, 'Error');
      }
    });
  }

  takeOrder(id:number){
    let confirmation = new OrderConfirmation();
    confirmation.id = id;
    confirmation.email = this.email;
    this.service.confirmOrder(confirmation).subscribe({
      next: (data) => {
        if(data === null){
          this.toastr.error('Order no longer avaliable');
          this.ngOnInit();
        }
        else{
          this.toastr.success('Order accepted');
          this.activeOrder = data;
          this.hasActiveOrder = true;
          this.timerTick();
        }
      },
      error: (error) => {
        this.toastr.error('Error');
      }
    });
  }

  interval:any = null;

  async timerTick(){
    if(this.interval === null){
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
    this.checkForUnconfirmedOrders();
  }

}
