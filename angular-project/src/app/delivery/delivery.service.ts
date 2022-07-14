import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Order } from '../shared/models/order.model';
import { Delivery } from './models/delivery.model';
import { OrderConfirmation } from './models/orderconfirmation.model';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {

  constructor(private http: HttpClient) { }

  getDeliveryInfo() : Observable<Delivery> {
    return this.http.get<Delivery>(environment.serverURL + '/api/delivery');
  }

  getUnconfirmedOrders() : Observable<Order[]> {
    return this.http.get<Order[]>(environment.serverURL + '/api/orders/unconfirmed');
  }

  getActiveOrder() : Observable<Order> {
    return this.http.get<Order>(environment.serverURL + '/api/orders/user/active');
  }

  confirmOrder(order:OrderConfirmation) : Observable<Order> {
    return this.http.post<Order>(environment.serverURL + '/api/orders/confirm', order);
  }

  getPreviousOrders() : Observable<Order[]> {
    return this.http.get<Order[]>(environment.serverURL + '/api/orders/user');
  }
}
